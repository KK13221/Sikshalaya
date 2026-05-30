import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../data/providers/mock_providers.dart';
import '../../models/app_models.dart';

class MarksPickerScreen extends ConsumerStatefulWidget {
  const MarksPickerScreen({super.key});

  @override
  ConsumerState<MarksPickerScreen> createState() => _MarksPickerScreenState();
}

class _MarksPickerScreenState extends ConsumerState<MarksPickerScreen> {
  String? _selectedClassId;
  String? _selectedType;

  static const _types = [
    _TypeRow('chapter', 'Chapter Test', 'After every chapter', AppColors.blue),
    _TypeRow('class', 'Class Test', 'Sample paper (you create)', AppColors.green),
    _TypeRow('unit', 'Unit Test', '3-monthly · scheduled', AppColors.yellow),
    _TypeRow('term', 'Term Examination', 'End of term', AppColors.red),
  ];

  @override
  Widget build(BuildContext context) {
    final classes = ref.watch(classListProvider);
    final chapters = _selectedClassId != null ? ref.watch(chaptersProvider(_selectedClassId!)) : <Chapter>[];

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
                onTap: () => setState(() => _selectedClassId = c.id),
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
          const Text('Test type', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.muted)),
          const SizedBox(height: 8),
          ..._types.map((t) {
            final selected = _selectedType == t.id;
            return GestureDetector(
              onTap: () => setState(() => _selectedType = t.id),
              child: Container(
                margin: const EdgeInsets.only(bottom: 6),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: selected ? t.color.withOpacity(0.06) : Colors.white,
                  border: Border.all(color: selected ? t.color : AppColors.lineFaint),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Container(width: 4, height: 36, decoration: BoxDecoration(color: t.color, borderRadius: BorderRadius.circular(2))),
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
          }),
          if (_selectedType == 'chapter' && chapters.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Text('Chapter (set by teacher)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.muted)),
            const SizedBox(height: 8),
            Card(
              child: Column(
                children: chapters.asMap().entries.map((e) {
                  final i = e.key;
                  final ch = e.value;
                  final isLast = i == chapters.length - 1;
                  final ready = ch.status == 'in_progress';
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: ready ? AppColors.blue.withOpacity(0.08) : Colors.white,
                      border: isLast ? null : const Border(bottom: BorderSide(color: AppColors.lineFaint)),
                    ),
                    child: Row(
                      children: [
                        SizedBox(width: 40, child: Text('Ch. ${ch.number}', style: TextStyle(fontFamily: 'monospace', fontSize: 10, fontWeight: FontWeight.w700, color: ready ? AppColors.blue : AppColors.muted))),
                        Expanded(child: Text(ch.name, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600))),
                        Text(
                          ch.status == 'done' ? '✓ Done' : ready ? 'In progress · ready' : '— Not yet',
                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: ready ? AppColors.blue : AppColors.muted),
                        ),
                      ],
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
            onPressed: _selectedClassId != null && _selectedType != null
                ? () => context.push('/marks/entry/draft-${_selectedClassId}-${_selectedType}')
                : null,
            child: const Text('Continue to marks entry →'),
          ),
        ),
      ),
    );
  }
}

class _TypeRow {
  const _TypeRow(this.id, this.label, this.sublabel, this.color);
  final String id;
  final String label;
  final String sublabel;
  final Color color;
}
