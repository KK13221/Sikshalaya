import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../data/providers/mock_providers.dart';
import '../../data/services/api_service.dart';
import '../../models/app_models.dart';

class MarksPickerScreen extends ConsumerStatefulWidget {
  const MarksPickerScreen({super.key});

  @override
  ConsumerState<MarksPickerScreen> createState() => _MarksPickerScreenState();
}

class _MarksPickerScreenState extends ConsumerState<MarksPickerScreen> {
  String? _selectedClassId;
  String? _selectedType;
  String? _selectedSubject;
  String? _selectedChapterId;
  bool _creating = false;
  final TextEditingController _maxMarksController = TextEditingController();

  @override
  void dispose() {
    _maxMarksController.dispose();
    super.dispose();
  }



  @override
  Widget build(BuildContext context) {
    final classes = ref.watch(classListProvider);
    final chapters = _selectedClassId != null ? ref.watch(chaptersProvider(_selectedClassId!)) : <Chapter>[];
    final typesAsync = ref.watch(assessmentTypesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Enter marks', style: TextStyle(fontWeight: FontWeight.w700))),
      body: ListView(
        padding: const EdgeInsets.all(14),
        children: [
          const Text('Class', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.muted)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: classes.map((c) {
              final selected = _selectedClassId == c.id;
              return GestureDetector(
                onTap: () {
                  setState(() {
                    if (_selectedClassId != c.id) {
                      _selectedClassId = c.id;
                      _selectedSubject = c.subjectList.isNotEmpty ? c.subjectList.first : null;
                      _selectedChapterId = null;
                    }
                  });
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: selected ? AppColors.blue.withOpacity(0.10) : Colors.white,
                    border: Border.all(color: selected ? AppColors.blue : AppColors.lineSoft),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(c.name, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: selected ? AppColors.blue : AppColors.ink)),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          if (_selectedClassId != null) ...[
            const Text('Subject', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.muted)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: classes.firstWhere((c) => c.id == _selectedClassId).subjectList.map((sub) {
                final selected = _selectedSubject == sub;
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      if (_selectedSubject != sub) {
                        _selectedSubject = sub;
                        _selectedChapterId = null;
                      }
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: selected ? AppColors.green.withOpacity(0.10) : Colors.white,
                      border: Border.all(color: selected ? AppColors.green : AppColors.lineSoft),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(sub, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: selected ? AppColors.green : AppColors.ink)),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
          ],
          const Text('Test type', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.muted)),
          const SizedBox(height: 8),
          ...typesAsync.when(
            data: (types) => types.map((t) {
              final selected = _selectedType == t.code;
              final color = _getColor(t.color);
              return GestureDetector(
                onTap: () => setState(() => _selectedType = t.code),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 6),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: selected ? color.withOpacity(0.06) : Colors.white,
                    border: Border.all(color: selected ? color : AppColors.lineFaint),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Container(width: 4, height: 36, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2))),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(t.label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                            Text(t.sublabel, style: const TextStyle(fontSize: 9, color: AppColors.muted)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
            loading: () => const [Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator()))],
            error: (err, stack) => [Center(child: Text('Error loading test types: $err'))],
          ),
          const SizedBox(height: 16),
          const Text('Max Marks', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.muted)),
          const SizedBox(height: 8),
          TextField(
            controller: _maxMarksController,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              hintText: 'e.g. 50 or 100',
              hintStyle: const TextStyle(fontSize: 13, color: AppColors.muted),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.lineSoft)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.lineSoft)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.blue)),
            ),
          ),
          if (_selectedSubject != null && chapters.where((ch) => ch.subject == _selectedSubject).isNotEmpty) ...[
            const SizedBox(height: 16),
            const Text('Chapter (Optional unless Chapter Test)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.muted)),
            const SizedBox(height: 8),
            Card(
              child: Column(
                children: chapters.where((ch) => ch.subject == _selectedSubject).toList().asMap().entries.map((e) {
                  final i = e.key;
                  final ch = e.value;
                  final isLast = i == chapters.where((ch) => ch.subject == _selectedSubject).length - 1;
                  final ready = ch.status == 'in_progress' || ch.status == 'done';
                  final selected = _selectedChapterId == ch.id;
                  
                  return GestureDetector(
                    onTap: () => setState(() => _selectedChapterId = selected ? null : ch.id),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: selected ? AppColors.blue.withOpacity(0.15) : (ready ? AppColors.blue.withOpacity(0.04) : Colors.white),
                        border: isLast ? null : const Border(bottom: BorderSide(color: AppColors.lineFaint)),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            selected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                            size: 16,
                            color: selected ? AppColors.blue : AppColors.muted,
                          ),
                          const SizedBox(width: 10),
                          SizedBox(width: 40, child: Text('Ch. ${ch.number}', style: TextStyle(fontFamily: 'monospace', fontSize: 10, fontWeight: FontWeight.w700, color: selected ? AppColors.blue : (ready ? AppColors.ink : AppColors.muted)))),
                          Expanded(child: Text(ch.name, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: selected ? AppColors.blue : AppColors.ink))),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: ElevatedButton(
            onPressed: (_selectedClassId != null && _selectedType != null && _selectedSubject != null && !_creating)
                ? () async {
                    if (_selectedType == 'chapter' && _selectedChapterId == null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please select a chapter for the chapter test')),
                      );
                      return;
                    }
                    if (_maxMarksController.text.trim().isEmpty || int.tryParse(_maxMarksController.text.trim()) == null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please enter a valid Max Marks')),
                      );
                      return;
                    }
                    setState(() => _creating = true);
                    final api = ref.read(apiServiceProvider);
                    final newAssessment = await api.createAssessment(
                      classId: _selectedClassId!,
                      type: _selectedType!,
                      subjectId: _selectedSubject!,
                      chapterId: _selectedChapterId,
                      maxMarks: int.tryParse(_maxMarksController.text.trim()),
                    );
                    setState(() => _creating = false);

                    if (newAssessment != null) {
                      if (context.mounted) {
                        context.push('/marks/entry/${newAssessment.id}');
                      }
                    } else {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Failed to create assessment')),
                        );
                      }
                    }
                  }
                : null,
            child: _creating
                ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Text('Continue to marks entry →'),
          ),
        ),
      ),
    );
  }
  Color _getColor(String colorName) {
    switch (colorName.toLowerCase()) {
      case 'red': return AppColors.red;
      case 'green': return AppColors.green;
      case 'yellow': return AppColors.yellow;
      case 'blue': default: return AppColors.blue;
    }
  }
}
