import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../data/providers/mock_providers.dart';
import '../../models/app_models.dart';

class MarksEntryScreen extends ConsumerStatefulWidget {
  final String assessmentId;
  const MarksEntryScreen({required this.assessmentId, super.key});

  @override
  ConsumerState<MarksEntryScreen> createState() => _MarksEntryScreenState();
}

class _MarksEntryScreenState extends ConsumerState<MarksEntryScreen> {
  // assessmentId format: "draft-{classId}-{type}"
  String get _classId {
    final parts = widget.assessmentId.split('-');
    return parts.length >= 2 ? parts[1] : '';
  }

  String? _findClassIdForAssessment(Assessment assessment, List<ClassInfo> classes) {
    final parts = assessment.classSection.split('-');
    if (parts.isEmpty) return null;
    
    final String assClassNumStr = parts[0];
    final String assSection = parts.length > 1 ? parts[1].toLowerCase().trim() : '';
    final int assClassNum = int.tryParse(assClassNumStr) ?? 0;

    for (final c in classes) {
      final nameDigitsOnly = c.name.replaceAll(RegExp(r'\D'), '');
      final int classNum = int.tryParse(nameDigitsOnly) ?? 0;

      final nameLower = c.name.toLowerCase();
      if (classNum == assClassNum &&
          (assSection.isEmpty ||
           nameLower.endsWith(' $assSection') ||
           nameLower.endsWith('-$assSection') ||
           nameLower == assSection)) {
        return c.id;
      }
    }
    return null;
  }

  final Map<String, TextEditingController> _controllers = {};
  final Map<String, TextEditingController> _writtenControllers = {};
  final Map<String, TextEditingController> _oralControllers = {};
  final Map<String, bool> _absent = {};
  bool _submitting = false;
  bool _submitted = false;
  Assessment? _assessment;

  @override
  void initState() {
    super.initState();
    _fetchAssessment();
  }

  Future<void> _fetchAssessment() async {
    final api = ref.read(apiServiceProvider);
    final a = await api.getAssessment(widget.assessmentId);
    if (mounted && a != null) {
      setState(() => _assessment = a);
    }
  }

  @override
  void dispose() {
    for (final c in _controllers.values) { c.dispose(); }
    for (final c in _writtenControllers.values) { c.dispose(); }
    for (final c in _oralControllers.values) { c.dispose(); }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final classes = ref.watch(classListProvider);
    
    String resolvedClassId = '';
    if (_assessment != null) {
      resolvedClassId = _findClassIdForAssessment(_assessment!, classes) ?? '';
    } else {
      resolvedClassId = _classId;
    }

    final students = resolvedClassId.isNotEmpty 
        ? ref.watch(studentListProvider(resolvedClassId)) 
        : const <Student>[];

    final bool isSA = _assessment?.type.startsWith('SA') ?? false;

    for (final s in students) {
      if (isSA) {
        _writtenControllers.putIfAbsent(s.id, () => TextEditingController());
        _oralControllers.putIfAbsent(s.id, () => TextEditingController());
      } else {
        _controllers.putIfAbsent(s.id, () => TextEditingController());
      }
      _absent.putIfAbsent(s.id, () => false);
    }

    final int maxMarksForTitle = isSA ? 60 : (_assessment?.maxMarks ?? 30);

    return Scaffold(
      appBar: AppBar(title: Text(_assessment != null ? '${_assessment!.title}' : 'Marks entry', style: const TextStyle(fontWeight: FontWeight.w700))),
      bottomNavigationBar: _submitted ? null : SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          child: ElevatedButton(
            onPressed: _submitting || students.isEmpty ? null : () async {
              // Validations
              for (final s in students) {
                if (_absent[s.id] ?? false) continue;

                if (isSA) {
                  final wText = _writtenControllers[s.id]?.text ?? '';
                  final oText = _oralControllers[s.id]?.text ?? '';
                  final w = double.tryParse(wText) ?? -1.0;
                  final o = double.tryParse(oText) ?? -1.0;

                  if (wText.isEmpty || oText.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Please enter both Written and Oral marks for ${s.name}')),
                    );
                    return;
                  }
                  if (w < 0 || w > 50) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Written marks for ${s.name} must be between 0 and 50')),
                    );
                    return;
                  }
                  if (o < 0 || o > 10) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Oral marks for ${s.name} must be between 0 and 10')),
                    );
                    return;
                  }
                } else {
                  final textVal = _controllers[s.id]?.text ?? '';
                  final m = double.tryParse(textVal) ?? -1.0;
                  final isFA = _assessment?.type.startsWith('FA') ?? false;
                  final double maxM = isFA ? 20.0 : (_assessment?.maxMarks.toDouble() ?? 30.0);

                  if (textVal.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Please enter marks for ${s.name}')),
                    );
                    return;
                  }
                  if (m < 0 || m > maxM) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Marks for ${s.name} must be between 0 and $maxM')),
                    );
                    return;
                  }
                }
              }

              setState(() => _submitting = true);
              final api = ref.read(apiServiceProvider);
              for (final s in students) {
                final absent = _absent[s.id] ?? false;
                double marks = 0.0;
                double? written;
                double? oral;

                if (isSA) {
                  written = double.tryParse(_writtenControllers[s.id]?.text ?? '') ?? 0.0;
                  oral = double.tryParse(_oralControllers[s.id]?.text ?? '') ?? 0.0;
                  marks = written + oral;
                } else {
                  marks = double.tryParse(_controllers[s.id]?.text ?? '') ?? 0.0;
                }

                await api.saveMark(
                  widget.assessmentId,
                  s.id,
                  marks,
                  absent,
                  writtenMarks: written,
                  oralMarks: oral,
                );

                if (!absent) {
                  String title = _assessment?.title ?? 'Class Test';
                  double maxMarks = isSA ? 60.0 : (_assessment?.maxMarks.toDouble() ?? 50.0);
                  String subject = _assessment?.subject ?? 'General';

                  ref.read(studentMarksHistoryProvider(s.id).notifier).addMarkRecord(
                    title: title,
                    subject: subject,
                    score: marks,
                    maxMarks: maxMarks,
                  );
                }
              }
              await api.submitAssessment(widget.assessmentId);
              if (mounted) {
                setState(() { _submitting = false; _submitted = true; });
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Marks submitted successfully!')),
                );
                if (resolvedClassId.isNotEmpty) {
                  context.go('/classes/$resolvedClassId');
                } else {
                  context.go('/classes');
                }
              }
            },
            child: _submitting
                ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Text('Submit assessment'),
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(_assessment != null ? 'Enter marks for each student out of $maxMarksForTitle' : 'Enter marks for each student.', style: const TextStyle(fontSize: 14, color: AppColors.muted)),
          const SizedBox(height: 16),
          if (students.isEmpty)
            const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
          else
            ...students.map((s) => _StudentMarkRow(
              student: s,
              isSA: isSA,
              controller: _controllers[s.id],
              writtenController: _writtenControllers[s.id],
              oralController: _oralControllers[s.id],
              isAbsent: _absent[s.id] ?? false,
              onAbsentToggle: (v) => setState(() => _absent[s.id] = v),
              onMarksChanged: () => setState(() {}),
            )),
          if (_submitted)
            const Center(child: Padding(
              padding: EdgeInsets.only(top: 16),
              child: Text('✅ Marks submitted!', style: TextStyle(color: AppColors.green, fontWeight: FontWeight.w700, fontSize: 15)),
            )),
        ],
      ),
    );
  }
}

class _StudentMarkRow extends StatelessWidget {
  const _StudentMarkRow({
    required this.student,
    required this.isSA,
    this.controller,
    this.writtenController,
    this.oralController,
    required this.isAbsent,
    required this.onAbsentToggle,
    required this.onMarksChanged,
  });

  final Student student;
  final bool isSA;
  final TextEditingController? controller;
  final TextEditingController? writtenController;
  final TextEditingController? oralController;
  final bool isAbsent;
  final ValueChanged<bool> onAbsentToggle;
  final VoidCallback onMarksChanged;

  @override
  Widget build(BuildContext context) {
    double totalScore = 0.0;
    if (isSA && writtenController != null && oralController != null) {
      final w = double.tryParse(writtenController!.text) ?? 0.0;
      final o = double.tryParse(oralController!.text) ?? 0.0;
      totalScore = w + o;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        child: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: AppColors.blue.withOpacity(0.1),
              child: Text(student.name.split(' ').where((w) => w.isNotEmpty).map((w) => w[0]).take(2).join(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.blue)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(student.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  Text(student.roll, style: const TextStyle(fontSize: 10, color: AppColors.muted)),
                ],
              ),
            ),
            if (isAbsent)
              const Text('Absent', style: TextStyle(fontSize: 11, color: AppColors.red, fontWeight: FontWeight.w600))
            else if (isSA && writtenController != null && oralController != null)
              Expanded(
                flex: 2,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: writtenController,
                            keyboardType: TextInputType.number,
                            onChanged: (val) => onMarksChanged(),
                            decoration: const InputDecoration(
                              hintText: 'W (50)',
                              contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                              border: OutlineInputBorder(),
                              isDense: true,
                            ),
                          ),
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: TextField(
                            controller: oralController,
                            keyboardType: TextInputType.number,
                            onChanged: (val) => onMarksChanged(),
                            decoration: const InputDecoration(
                              hintText: 'O (10)',
                              contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                              border: OutlineInputBorder(),
                              isDense: true,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Total: ${totalScore.toStringAsFixed(1)} / 60.0',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: AppColors.blue),
                    ),
                  ],
                ),
              )
            else if (controller != null)
              SizedBox(
                width: 70,
                child: TextField(
                  controller: controller,
                  keyboardType: TextInputType.number,
                  onChanged: (val) => onMarksChanged(),
                  decoration: const InputDecoration(
                    hintText: 'Marks',
                    contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                    border: OutlineInputBorder(),
                    isDense: true,
                  ),
                ),
              ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: () => onAbsentToggle(!isAbsent),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isAbsent ? AppColors.red.withOpacity(0.1) : AppColors.lineFaint,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: isAbsent ? AppColors.red : AppColors.lineSoft),
                ),
                child: Text('A', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: isAbsent ? AppColors.red : AppColors.muted)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
