import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../data/providers/mock_providers.dart';
import '../../models/app_models.dart';

class ClassDetailScreen extends ConsumerWidget {
  const ClassDetailScreen({required this.classId, super.key});
  final String classId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final students = ref.watch(studentListProvider(classId));
    final classes = ref.watch(classListProvider);
    final currentClass = classes.firstWhere(
      (c) => c.id == classId,
      orElse: () => ClassInfo(id: classId, name: 'Class $classId', subject: '', students: 0, attendancePercent: 0),
    );

    return Scaffold(
      appBar: AppBar(
        title: Text(currentClass.name, style: const TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: _RosterTab(students: students),
    );
  }
}

class _RosterTab extends ConsumerWidget {
  const _RosterTab({required this.students});
  final List<Student> students;

  Color _getPerformanceColor(Student s, int green, int yellow) {
    if (s.isUnderperformer) return const Color(0xFFEF4444); // Red
    final score = (s.academicsPct ?? 0.0) * 0.6 + (s.punctualityPct ?? 0.0) * 0.4;
    if (score < yellow) return const Color(0xFFEF4444); // Red
    if (score < green) return const Color(0xFFF59E0B); // Yellow
    return const Color(0xFF22C55E); // Green
  }

  String _getPerformanceLabel(Student s, int green, int yellow) {
    if (s.isUnderperformer) return 'URGENT';
    final score = (s.academicsPct ?? 0.0) * 0.6 + (s.punctualityPct ?? 0.0) * 0.4;
    if (score < yellow) return 'URGENT';
    if (score < green) return 'AVERAGE';
    return 'GOOD';
  }

  int _getCombinedScore(Student s) {
    final score = (s.academicsPct ?? 0.0) * 0.6 + (s.punctualityPct ?? 0.0) * 0.4;
    return score.round();
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final greenThreshold = user.greenThreshold;
    final yellowThreshold = user.yellowThreshold;

    return ListView.separated(
      padding: const EdgeInsets.all(14),
      itemCount: students.length,
      separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.lineFaint),
      itemBuilder: (context, i) {
        final s = students[i];
        final color = _getPerformanceColor(s, greenThreshold, yellowThreshold);
        final label = _getPerformanceLabel(s, greenThreshold, yellowThreshold);
        final score = _getCombinedScore(s);

        return ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
          leading: CircleAvatar(
            backgroundColor: color.withOpacity(0.12),
            child: Text(
              s.name.split(' ').where((w) => w.isNotEmpty).map((w) => w[0]).take(2).join(),
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: color),
            ),
          ),
          title: Text(s.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
          subtitle: Text(
            'Roll ${s.roll} · Academics: ${s.academicsPct?.toInt() ?? 0}% · Attendance: ${s.punctualityPct?.toInt() ?? 0}%',
            style: const TextStyle(fontSize: 10, color: AppColors.muted),
          ),
          trailing: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: color.withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: color.withOpacity(0.3), width: 1),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '$score%',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color),
                ),
                Text(
                  label,
                  style: TextStyle(fontSize: 8, fontWeight: FontWeight.w700, color: color, letterSpacing: 0.2),
                ),
              ],
            ),
          ),
          onTap: () => context.push('/student/${s.id}'),
        );
      },
    );
  }
}
