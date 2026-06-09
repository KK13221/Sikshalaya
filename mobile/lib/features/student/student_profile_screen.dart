import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../data/providers/mock_providers.dart';
import '../../models/app_models.dart';

class StudentProfileScreen extends ConsumerWidget {
  const StudentProfileScreen({required this.studentId, super.key});
  final String studentId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final studentAsync = ref.watch(studentByIdProvider(studentId));
    final student = studentAsync.whenData((s) => s).value;
    if (student == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Student')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Student', style: TextStyle(fontWeight: FontWeight.w700)),
          actions: const [Padding(padding: EdgeInsets.only(right: 14), child: Icon(Icons.more_horiz))],
        ),
        body: Column(
          children: [
            if (student.isUnderperformer)
              Container(
                color: AppColors.red,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                child: Row(
                  children: [
                    Container(
                      width: 18, height: 18,
                      decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                      alignment: Alignment.center,
                      child: const Text('!', style: TextStyle(color: AppColors.red, fontWeight: FontWeight.w800, fontSize: 11)),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Underperformer — below 75% in ${student.flaggedDims.join(", ")}',
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ],
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 28,
                        backgroundColor: AppColors.blue.withOpacity(0.10),
                        child: Text(student.name.split(' ').where((w) => w.isNotEmpty).map((w) => w[0]).take(2).join(), style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.blue, fontSize: 15)),
                      ),
                      const SizedBox(height: 8),
                      Text(student.name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                      Text('${student.classSection} · ${student.roll} · ${student.age != null ? "${student.age} yrs" : ""}', style: const TextStyle(fontSize: 10, color: AppColors.muted)),
                    ],
                  ),
                ),
              ),
            ),
            const TabBar(
              labelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
              tabs: [Tab(text: 'Overview'), Tab(text: 'Marks'), Tab(text: 'Attendance'), Tab(text: 'Notes')],
            ),
            Expanded(
              child: TabBarView(children: [
                _OverviewTab(student: student),
                _MarksTab(studentId: student.id),
                _AttendanceTab(studentId: student.id),
                _NotesTab(student: student),
              ]),
            ),
          ],
        ),
      ),
    );
  }
}

class _OverviewTab extends StatelessWidget {
  const _OverviewTab({required this.student});
  final Student student;

  Color _dimColor(double? val) {
    if (val == null) return AppColors.muted;
    if (val < 75) return AppColors.red;
    if (val < 85) return AppColors.yellow;
    return AppColors.green;
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        Row(
          children: [
            _MetricCard(title: 'Academics', value: student.academicsPct != null ? '${student.academicsPct!.toInt()}%' : '—', color: _dimColor(student.academicsPct), flagged: student.flaggedDims.contains('academics')),
            const SizedBox(width: 8),
            _MetricCard(title: 'Punctuality', value: student.punctualityPct != null ? '${student.punctualityPct!.toInt()}%' : '—', color: _dimColor(student.punctualityPct), flagged: student.flaggedDims.contains('punctuality')),
            const SizedBox(width: 8),
            _MetricCard(title: 'Behaviour', value: student.behaviourScore != null ? '${student.behaviourScore!.toInt()}' : '—', color: _dimColor(student.behaviourScore), flagged: student.flaggedDims.contains('behaviour')),
          ],
        ),
        const SizedBox(height: 16),
        const Text('Parent / Guardian', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.muted)),
        const SizedBox(height: 8),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 16, 
                  backgroundColor: AppColors.lineFaint, 
                  child: Text(student.guardianName != null && student.guardianName!.isNotEmpty ? student.guardianName![0].toUpperCase() : 'P', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.muted))
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(student.guardianName ?? 'Unknown Guardian', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                      Text('${student.guardianRelation ?? "Parent"} · primary contact', style: const TextStyle(fontSize: 10, color: AppColors.muted)),
                    ],
                  ),
                ),
                if (student.guardianPhone != null && student.guardianPhone!.isNotEmpty)
                  _IconBtn(icon: Icons.phone, color: AppColors.blue, onTap: () {}),
                if (student.guardianEmail != null && student.guardianEmail!.isNotEmpty) ...[
                  const SizedBox(width: 6),
                  _IconBtn(icon: Icons.email, color: AppColors.green, onTap: () {}),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.title, required this.value, required this.color, this.flagged = false});
  final String title;
  final String value;
  final Color color;
  final bool flagged;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: flagged ? AppColors.red.withOpacity(0.05) : Colors.white,
          border: Border.all(color: flagged ? AppColors.red : AppColors.lineFaint),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: color)),
            Text(title, style: const TextStyle(fontSize: 9, color: AppColors.muted)),
            if (flagged) const Text('BELOW 75', style: TextStyle(fontSize: 8, color: AppColors.red, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }
}

class _IconBtn extends StatelessWidget {
  const _IconBtn({required this.icon, required this.color, required this.onTap});
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32, height: 32,
        decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, size: 16, color: color),
      ),
    );
  }
}

class _MarksTab extends ConsumerWidget {
  const _MarksTab({required this.studentId});
  final String studentId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final marks = ref.watch(studentMarksHistoryProvider(studentId));
    if (marks.isEmpty) {
      return const Center(child: Text('No marks recorded.', style: TextStyle(color: AppColors.muted)));
    }

    final validMarks = marks.where((m) => m['percentage'] != null).toList();
    final avg = validMarks.isEmpty ? 0.0 : validMarks.map((m) => (m['percentage'] as num).toDouble()).reduce((a, b) => a + b) / validMarks.length;

    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(
                  children: [
                    Text('${avg.toStringAsFixed(1)}%', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.blue)),
                    const Text('Average Score', style: TextStyle(fontSize: 9, color: AppColors.muted)),
                  ],
                ),
                Container(width: 1, height: 32, color: AppColors.lineFaint),
                Column(
                  children: [
                    Text('${marks.length}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.green)),
                    const Text('Tests Taken', style: TextStyle(fontSize: 9, color: AppColors.muted)),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        const Text('Assessment History', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.muted)),
        const SizedBox(height: 6),
        ...marks.map((m) {
          final pct = (m['percentage'] as num?)?.toDouble() ?? 0.0;
          Color pctColor = AppColors.green;
          if (pct < 75) {
            pctColor = AppColors.red;
          } else if (pct < 85) {
            pctColor = AppColors.yellow;
          }

          final date = m['date'] is DateTime ? m['date'] as DateTime : DateTime.tryParse(m['date'].toString()) ?? DateTime.now();
          final dateStr = '${date.day} ${_monthName(date.month)}';

          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              title: Text(m['title'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
              subtitle: Text('${m['subject']} · $dateStr', style: const TextStyle(fontSize: 10, color: AppColors.muted)),
              trailing: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('${(m['score'] as num?)?.toInt() ?? '-'}/${(m['maxMarks'] as num?)?.toInt() ?? '-'}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(color: pctColor.withOpacity(0.12), borderRadius: BorderRadius.circular(4)),
                    child: Text('${pct.toInt()}%', style: TextStyle(fontSize: 9, color: pctColor, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  String _monthName(int month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  }
}

class _AttendanceTab extends ConsumerWidget {
  const _AttendanceTab({required this.studentId});
  final String studentId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final attendance = ref.watch(studentAttendanceHistoryProvider(studentId));
    if (attendance.isEmpty) {
      return const Center(child: Text('No attendance records.', style: TextStyle(color: AppColors.muted)));
    }

    final total = attendance.length;
    final present = attendance.where((a) => a['status'] == 'Present').length;
    final absent = attendance.where((a) => a['status'] == 'Absent').length;
    final lateCount = attendance.where((a) => a['status'] == 'Late').length;
    final rate = total > 0 ? (present / total) * 100 : 0.0;

    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(
                  children: [
                    Text('${rate.toStringAsFixed(1)}%', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: rate >= 75 ? AppColors.green : AppColors.red)),
                    const Text('Attendance Rate', style: TextStyle(fontSize: 9, color: AppColors.muted)),
                  ],
                ),
                Container(width: 1, height: 32, color: AppColors.lineFaint),
                _StatCol(count: present, label: 'Present', color: AppColors.green),
                _StatCol(count: absent, label: 'Absent', color: AppColors.red),
                _StatCol(count: lateCount, label: 'Late', color: AppColors.yellow),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        const Text('Daily Logs (Last 30 Days)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.muted)),
        const SizedBox(height: 6),
        ...attendance.map((a) {
          final date = a['date'] is DateTime ? a['date'] as DateTime : DateTime.tryParse(a['date'].toString()) ?? DateTime.now();
          final dateStr = '${date.day} ${_monthName(date.month)}, ${_weekday(date.weekday)}';
          final status = (a['status'] as String?) ?? 'Unknown';

          Color statusColor = AppColors.green;
          IconData statusIcon = Icons.check_circle_outline;
          if (status == 'Absent') {
            statusColor = AppColors.red;
            statusIcon = Icons.cancel_outlined;
          } else if (status == 'Late') {
            statusColor = AppColors.yellow;
            statusIcon = Icons.access_time;
          }

          return Card(
            margin: const EdgeInsets.only(bottom: 6),
            child: ListTile(
              dense: true,
              leading: Icon(statusIcon, color: statusColor, size: 18),
              title: Text(dateStr, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
              trailing: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                child: Text(status, style: TextStyle(fontSize: 9, color: statusColor, fontWeight: FontWeight.bold)),
              ),
            ),
          );
        }),
      ],
    );
  }

  String _monthName(int month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  }

  String _weekday(int day) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[day - 1];
  }
}

class _StatCol extends StatelessWidget {
  const _StatCol({required this.count, required this.label, required this.color});
  final int count;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('$count', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: color)),
        Text(label, style: const TextStyle(fontSize: 9, color: AppColors.muted)),
      ],
    );
  }
}

class _NotesTab extends ConsumerWidget {
  const _NotesTab({required this.student});
  final Student student;

  void _showAddBehaviourSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (ctx) => _BehaviourMetricSheet(student: student),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final logs = ref.watch(studentBehaviourProvider(student.id));

    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Behaviour Logs', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.muted)),
            ElevatedButton.icon(
              onPressed: () => _showAddBehaviourSheet(context, ref),
              icon: const Icon(Icons.add, size: 12),
              label: const Text('Log Behaviour', style: TextStyle(fontSize: 10)),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                backgroundColor: AppColors.blue,
                foregroundColor: Colors.white,
                minimumSize: const Size(0, 32),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        if (logs.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 40),
            child: Center(child: Text('No behavior notes logged.', style: TextStyle(color: AppColors.muted))),
          )
        else
          ...logs.map((log) {
            final isPositive = log.kind == '+';
            final color = isPositive ? AppColors.green : AppColors.red;
            final date = log.loggedAt;
            final dateStr = '${date.day} ${_monthName(date.month)} ${date.hour}:${date.minute.toString().padLeft(2, "0")}';

            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: Container(
                decoration: BoxDecoration(
                  border: Border(left: BorderSide(color: color, width: 4)),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  title: Text(log.preset, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
                  subtitle: Text('Logged on $dateStr by Teacher', style: const TextStyle(fontSize: 9, color: AppColors.muted)),
                  trailing: Text(
                    isPositive ? '+1 Point' : '-1 Point',
                    style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 11),
                  ),
                ),
              ),
            );
          }),
      ],
    );
  }

  String _monthName(int month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  }
}

// ── Dynamic Behaviour Metric Sheet ────────────────────────────────────────
class _BehaviourMetricSheet extends ConsumerWidget {
  const _BehaviourMetricSheet({required this.student});
  final Student student;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final metricsAsync = ref.watch(behaviourMetricsProvider);

    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      maxChildSize: 0.9,
      minChildSize: 0.4,
      expand: false,
      builder: (ctx, scrollController) {
        return Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 36, height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              const Text('Log Student Behaviour',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              const Text('Select a metric to log (configured by school admin)',
                  style: TextStyle(fontSize: 12, color: Colors.black54)),
              const SizedBox(height: 12),
              Expanded(
                child: metricsAsync.when(
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Center(child: Text('Error loading metrics: $e')),
                  data: (metrics) {
                    if (metrics.isEmpty) {
                      return const Center(child: Text('No metrics configured yet.'));
                    }
                    return ListView.builder(
                      controller: scrollController,
                      itemCount: metrics.length,
                      itemBuilder: (context, idx) {
                        final m = metrics[idx];
                        final isPositive = m.kind == 'positive';
                        final color = isPositive ? AppColors.green : AppColors.red;
                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            dense: true,
                            leading: CircleAvatar(
                              radius: 14,
                              backgroundColor: color.withOpacity(0.12),
                              child: Icon(
                                isPositive ? Icons.add : Icons.remove,
                                color: color,
                                size: 14,
                              ),
                            ),
                            title: Text(m.name,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w600, fontSize: 12)),
                            subtitle: Text(
                              '${m.category} · ${isPositive ? '+' : ''}${m.weight} pts',
                              style: TextStyle(fontSize: 10, color: color),
                            ),
                            trailing: const Icon(Icons.arrow_forward_ios, size: 10),
                            onTap: () {
                              ref
                                  .read(studentBehaviourProvider(student.id).notifier)
                                  .addLog(m.name, isPositive ? '+' : '-', m.id);
                              Navigator.pop(ctx);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Logged: ${m.name}'),
                                  backgroundColor: AppColors.green,
                                  duration: const Duration(seconds: 2),
                                ),
                              );
                            },
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
