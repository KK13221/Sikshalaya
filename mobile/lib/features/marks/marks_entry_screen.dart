import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../data/providers/mock_providers.dart';
import '../../data/services/api_service.dart';
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

  final Map<String, TextEditingController> _controllers = {};
  final Map<String, bool> _absent = {};
  bool _submitting = false;
  bool _submitted = false;

  @override
  void dispose() {
    for (final c in _controllers.values) { c.dispose(); }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final students = ref.watch(studentListProvider(_classId));

    for (final s in students) {
      _controllers.putIfAbsent(s.id, () => TextEditingController());
      _absent.putIfAbsent(s.id, () => false);
    }

    return Scaffold(
      appBar: AppBar(title: Text('Marks entry', style: const TextStyle(fontWeight: FontWeight.w700))),
      bottomNavigationBar: _submitted ? null : SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          child: ElevatedButton(
            onPressed: _submitting || students.isEmpty ? null : () async {
              setState(() => _submitting = true);
              final api = ref.read(apiServiceProvider);
              for (final s in students) {
                final textVal = _controllers[s.id]?.text ?? '';
                final marks = double.tryParse(textVal) ?? 0.0;
                final absent = _absent[s.id] ?? false;
                await api.saveMark(widget.assessmentId, s.id, marks, absent);

                if (!absent && textVal.isNotEmpty) {
                  final idParts = widget.assessmentId.split('-');
                  final type = idParts.length >= 3 ? idParts[2] : 'chapter';
                  String title = 'Class Test';
                  double maxMarks = 50.0;
                  if (type == 'chapter') {
                    title = 'Chapter Test';
                    maxMarks = 25.0;
                  } else if (type == 'unit') {
                    title = 'Unit Test';
                    maxMarks = 100.0;
                  } else if (type == 'term') {
                    title = 'Term Exam';
                    maxMarks = 100.0;
                  }

                  ref.read(studentMarksHistoryProvider(s.id).notifier).addMarkRecord(
                    title: title,
                    subject: 'Mathematics',
                    score: marks,
                    maxMarks: maxMarks,
                  );
                }
              }
              setState(() { _submitting = false; _submitted = true; });
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
          Text('Enter marks for each student.', style: const TextStyle(fontSize: 14, color: AppColors.muted)),
          const SizedBox(height: 16),
          if (students.isEmpty)
            const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
          else
            ...students.map((s) => _StudentMarkRow(
              student: s,
              controller: _controllers[s.id]!,
              isAbsent: _absent[s.id] ?? false,
              onAbsentToggle: (v) => setState(() => _absent[s.id] = v),
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
  const _StudentMarkRow({required this.student, required this.controller, required this.isAbsent, required this.onAbsentToggle});
  final Student student;
  final TextEditingController controller;
  final bool isAbsent;
  final ValueChanged<bool> onAbsentToggle;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        child: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: AppColors.blue.withOpacity(0.1),
              child: Text(student.name.split(' ').map((w) => w[0]).take(2).join(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.blue)),
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
            else
              SizedBox(
                width: 70,
                child: TextField(
                  controller: controller,
                  keyboardType: TextInputType.number,
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
