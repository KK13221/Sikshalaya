import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../data/providers/mock_providers.dart';
import '../../data/services/api_service.dart';
import '../../models/app_models.dart';

class AttendanceScreen extends ConsumerStatefulWidget {
  final String classId;
  const AttendanceScreen({required this.classId, super.key});

  @override
  ConsumerState<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends ConsumerState<AttendanceScreen> {
  // All state managed locally — no race with external providers
  List<Student> _students = [];
  Map<String, String> _attendance = {};
  bool _loading = true;
  bool _submitting = false;
  bool _alreadySaved = false; // attendance exists in DB for this date
  String _successMsg = '';
  String _errorMsg = '';
  bool _hasChanges = false;
  DateTime _selectedDate = DateTime.now();
  Timer? _refreshTimer;
  DateTime? _lastSync;

  String get _dateStr {
    final d = _selectedDate;
    return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
  }

  @override
  void initState() {
    super.initState();
    _loadAll();
    // Auto-refresh every 30s so admin panel changes appear on mobile
    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (!_hasChanges && mounted) _silentRefresh();
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  // Silent refresh — only updates attendance from DB, does NOT reset user's pending changes
  Future<void> _silentRefresh() async {
    try {
      final api = ref.read(apiServiceProvider);
      final attendanceList = await api.getAttendance(widget.classId, date: _dateStr);
      if (!mounted) return;
      if (attendanceList.isNotEmpty) {
        final records = attendanceList.first['records'] as List? ?? [];
        const statusMap = {'P': 'present', 'A': 'absent', 'L': 'late'};
        final updated = <String, String>{};
        for (final rec in records) {
          final sid = rec['studentId']?.toString();
          final raw = rec['status']?.toString() ?? 'present';
          if (sid != null) updated[sid] = statusMap[raw] ?? raw;
        }
        // Fill any students not in the attendance record with 'present'
        for (final s in _students) {
          updated.putIfAbsent(s.id, () => 'present');
        }
        setState(() {
          _attendance = updated;
          _alreadySaved = records.isNotEmpty;
          _lastSync = DateTime.now();
        });
      }
    } catch (_) {}
  }

  // Load students + existing attendance together — no race condition
  Future<void> _loadAll() async {
    setState(() { _loading = true; _successMsg = ''; _errorMsg = ''; });
    try {
      final api = ref.read(apiServiceProvider);

      // Parallel load
      final results = await Future.wait([
        api.getStudents(widget.classId),
        api.getAttendance(widget.classId, date: _dateStr),
      ]);

      final students = results[0] as List<Student>;
      final attendanceList = results[1] as List<dynamic>;

      // Build attendance map — start with all present
      final map = <String, String>{};
      for (final s in students) {
        map[s.id] = 'present';
      }

      // Overlay with existing DB records
      bool savedInDb = false;
      if (attendanceList.isNotEmpty) {
        final records = attendanceList.first['records'] as List? ?? [];
        const statusMap = {'P': 'present', 'A': 'absent', 'L': 'late'};
        for (final rec in records) {
          final sid = rec['studentId']?.toString();
          final raw = rec['status']?.toString() ?? 'present';
          if (sid != null && map.containsKey(sid)) {
            map[sid] = statusMap[raw] ?? raw;
          }
        }
        savedInDb = records.isNotEmpty;
      }

      if (mounted) {
        setState(() {
          _students = students;
          _attendance = map;
          _alreadySaved = savedInDb;
          _hasChanges = false;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loading = false;
          _errorMsg = 'Could not load data. Check your connection.';
        });
      }
    }
  }

  void _toggle(String studentId) {
    setState(() {
      final cur = _attendance[studentId] ?? 'present';
      _attendance[studentId] = cur == 'present' ? 'absent' : cur == 'absent' ? 'late' : 'present';
      _hasChanges = true;
      _successMsg = '';
    });
  }

  Future<void> _submit() async {
    if (_students.isEmpty) return;
    setState(() { _submitting = true; _errorMsg = ''; _successMsg = ''; });

    try {
      final api = ref.read(apiServiceProvider);
      final records = _attendance.entries
          .map((e) => <String, dynamic>{'studentId': e.key, 'status': e.value})
          .toList();

      final success = await api.saveAttendance(widget.classId, _dateStr, records);

      if (!mounted) return;
      if (success) {
        setState(() {
          _submitting = false;
          _alreadySaved = true;
          _hasChanges = false;
          _successMsg = 'Attendance saved!';
          _errorMsg = '';
        });
      } else {
        setState(() {
          _submitting = false;
          _errorMsg = 'Save failed. Please try again.';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _submitting = false;
          _errorMsg = 'Error: ${e.toString().split('\n').first}';
        });
      }
    }
  }

  Future<void> _pickDate(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now().subtract(const Duration(days: 60)),
      lastDate: DateTime.now(),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
        _hasChanges = false;
        _successMsg = '';
        _errorMsg = '';
      });
      _loadAll();
    }
  }

  bool get _isToday {
    final n = DateTime.now();
    return _selectedDate.year == n.year && _selectedDate.month == n.month && _selectedDate.day == n.day;
  }

  @override
  Widget build(BuildContext context) {
    final present = _attendance.values.where((s) => s == 'present').length;
    final absent  = _attendance.values.where((s) => s == 'absent').length;
    final late    = _attendance.values.where((s) => s == 'late').length;

    return WillPopScope(
      onWillPop: () async {
        if (_hasChanges) {
          final result = await showDialog<String>(
            context: context,
            builder: (ctx) => AlertDialog(
              title: const Text('Unsaved attendance'),
              content: const Text('You have changes that are not saved. What would you like to do?'),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx, 'leave'), child: const Text('Leave')),
                ElevatedButton(onPressed: () => Navigator.pop(ctx, 'save'), child: const Text('Save & leave')),
              ],
            ),
          );
          if (result == 'save') {
            await _submit();
            if (mounted) Navigator.pop(context);
            return false;
          }
          return result == 'leave';
        }
        return true;
      },
      child: Scaffold(
        // Show button only when there is something to save:
        // - First time (never submitted) → always show "Submit"
        // - Already saved + no changes → HIDE (nothing to update)
        // - Already saved + changes made → show "Update"
        bottomNavigationBar: _loading || (_alreadySaved && !_hasChanges)
            ? null
            : SafeArea(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                  child: SizedBox(
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _submitting ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.blue,
                        disabledBackgroundColor: AppColors.muted,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _submitting
                          ? const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                SizedBox(height: 20, width: 20,
                                    child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white)),
                                SizedBox(width: 12),
                                Text('Saving…', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                              ],
                            )
                          : Text(
                              _alreadySaved ? 'Update Attendance' : 'Submit Attendance',
                              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700),
                            ),
                    ),
                  ),
                ),
              ),
        appBar: AppBar(
          title: Text('Attendance · Class ${widget.classId}'),
          actions: [
            TextButton.icon(
              onPressed: _loading ? null : () => _pickDate(context),
              icon: const Icon(Icons.calendar_today, size: 15, color: AppColors.blue),
              label: Text(
                _isToday ? 'Today' : '${_selectedDate.day}/${_selectedDate.month}',
                style: const TextStyle(color: AppColors.blue, fontWeight: FontWeight.w600, fontSize: 13),
              ),
            ),
          ],
        ),
        body: _loading
            ? const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 12),
                    Text('Loading attendance…', style: TextStyle(color: AppColors.muted)),
                  ],
                ),
              )
            : Column(
                children: [
                  // ── Status banner ──────────────────────────────────────────
                  if (_successMsg.isNotEmpty)
                    _Banner(msg: _successMsg, color: AppColors.green, icon: Icons.check_circle),
                  if (_errorMsg.isNotEmpty)
                    _Banner(msg: _errorMsg, color: AppColors.red, icon: Icons.error_outline),
                  if (_alreadySaved && !_hasChanges && _successMsg.isEmpty && _errorMsg.isEmpty)
                    _Banner(
                      msg: _isToday
                          ? 'Attendance already marked for today. Tap students to edit, then Update.'
                          : 'Attendance loaded for ${_selectedDate.day}/${_selectedDate.month}. Tap to edit.',
                      color: AppColors.green,
                      icon: Icons.check_circle_outline,
                    ),

                  // ── Summary + Submit bar ───────────────────────────────────
                  Container(
                    padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4, offset: const Offset(0, 2))],
                    ),
                    child: Row(
                      children: [
                        _Chip(label: 'Present', count: present, color: AppColors.green),
                        const SizedBox(width: 8),
                        _Chip(label: 'Absent', count: absent, color: AppColors.red),
                        const SizedBox(width: 8),
                        _Chip(label: 'Late', count: late, color: AppColors.yellow),
                        const Spacer(),
                        Text('${_students.length} total',
                            style: const TextStyle(fontSize: 11, color: AppColors.muted)),
                      ],
                    ),
                  ),

                  // ── Hint + sync time ──────────────────────────────────────
                  Padding(
                    padding: const EdgeInsets.fromLTRB(14, 8, 14, 2),
                    child: Row(
                      children: [
                        const Text('Tap: Present → Absent → Late',
                            style: TextStyle(fontSize: 11, color: AppColors.muted)),
                        const Spacer(),
                        if (_lastSync != null)
                          Text(
                            'Synced ${_lastSync!.hour.toString().padLeft(2, '0')}:${_lastSync!.minute.toString().padLeft(2, '0')} · Pull to refresh',
                            style: const TextStyle(fontSize: 10, color: AppColors.muted),
                          )
                        else
                          const Text('Pull down to refresh',
                              style: TextStyle(fontSize: 10, color: AppColors.muted)),
                      ],
                    ),
                  ),

                  // ── Student list (pull-to-refresh) ────────────────────────
                  Expanded(
                    child: RefreshIndicator(
                      onRefresh: () async => _loadAll(),
                      color: AppColors.blue,
                      child: _students.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.group_off, size: 40, color: AppColors.muted),
                                const SizedBox(height: 8),
                                const Text('No students found in this class.',
                                    style: TextStyle(color: AppColors.muted)),
                                const SizedBox(height: 12),
                                TextButton(onPressed: _loadAll, child: const Text('Retry')),
                              ],
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.fromLTRB(12, 4, 12, 24),
                            itemCount: _students.length,
                            itemBuilder: (context, i) {
                              final s = _students[i];
                              final status = _attendance[s.id] ?? 'present';
                              final color = status == 'present'
                                  ? AppColors.green
                                  : status == 'absent'
                                      ? AppColors.red
                                      : AppColors.yellow;
                              return InkWell(
                                onTap: () => _toggle(s.id),
                                borderRadius: BorderRadius.circular(8),
                                child: Container(
                                  margin: const EdgeInsets.symmetric(vertical: 3),
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                  decoration: BoxDecoration(
                                    color: color.withOpacity(0.05),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: color.withOpacity(0.3)),
                                  ),
                                  child: Row(
                                    children: [
                                      CircleAvatar(
                                        radius: 17,
                                        backgroundColor: color.withOpacity(0.15),
                                        child: Text(
                                          s.name.split(' ').map((w) => w[0]).take(2).join(),
                                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color),
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(s.name,
                                                style: const TextStyle(
                                                    fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.ink)),
                                            Text(s.roll,
                                                style: const TextStyle(fontSize: 10, color: AppColors.muted)),
                                          ],
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                                        decoration: BoxDecoration(
                                          color: color,
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          status == 'present' ? 'P' : status == 'absent' ? 'A' : 'L',
                                          style: const TextStyle(
                                              color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                    ),  // RefreshIndicator
                  ),   // Expanded
                ],
              ),
      ),
    );
  }
}

class _Banner extends StatelessWidget {
  const _Banner({required this.msg, required this.color, required this.icon});
  final String msg;
  final Color color;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      color: color.withOpacity(0.1),
      child: Row(children: [
        Icon(icon, color: color, size: 16),
        const SizedBox(width: 8),
        Expanded(child: Text(msg, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600))),
      ]),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.label, required this.count, required this.color});
  final String label;
  final int count;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('$count', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: color)),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
