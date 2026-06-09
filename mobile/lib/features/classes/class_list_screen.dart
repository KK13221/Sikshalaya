import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../data/providers/mock_providers.dart';
import '../../models/app_models.dart';

class ClassListScreen extends ConsumerWidget {
  const ClassListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final classes = ref.watch(classListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('My classes', style: TextStyle(fontWeight: FontWeight.w700))),
      body: RefreshIndicator(
        onRefresh: () => ref.read(classListProvider.notifier).loadClasses(),
        child: ListView.separated(
          padding: const EdgeInsets.all(14),
          itemCount: classes.length,
          separatorBuilder: (_, __) => const SizedBox(height: 10),
          itemBuilder: (context, i) => _ClassCard(info: classes[i]),
        ),
      ),
    );
  }
}

class _ClassCard extends StatelessWidget {
  const _ClassCard({required this.info});
  final ClassInfo info;

  Color get _attendanceColor {
    if (info.attendancePercent >= 90) return AppColors.green;
    if (info.attendancePercent >= 75) return AppColors.yellow;
    return AppColors.red;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: _attendanceColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: Text(info.name, style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: _attendanceColor)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Class ${info.name}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                      Text('${info.subject} · ${info.students} students', style: const TextStyle(fontSize: 10, color: AppColors.muted)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('${info.attendancePercent}%', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: _attendanceColor)),
                    const Text('attendance', style: TextStyle(fontSize: 9, color: AppColors.muted)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                _ActionBtn(label: 'Roster', onTap: () => context.push('/classes/${info.id}')),
                const SizedBox(width: 8),
                _ActionBtn(label: 'Marks', onTap: () => context.push('/marks')),
                const SizedBox(width: 8),
                _ActionBtn(label: 'Attendance', primary: true, onTap: () => context.push('/attendance/${info.id}')),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  const _ActionBtn({required this.label, required this.onTap, this.primary = false});
  final String label;
  final VoidCallback onTap;
  final bool primary;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: primary ? AppColors.blue : Colors.white,
            border: Border.all(color: primary ? AppColors.blue : AppColors.lineSoft),
            borderRadius: BorderRadius.circular(6),
          ),
          alignment: Alignment.center,
          child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: primary ? Colors.white : AppColors.ink)),
        ),
      ),
    );
  }
}
