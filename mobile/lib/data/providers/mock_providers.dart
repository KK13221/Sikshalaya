import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/app_models.dart';
import '../services/api_service.dart';

final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

final currentUserProvider = StateProvider<TeacherUser>((ref) {
  return const TeacherUser(id: '', name: '', email: '', branch: '');
});

// ─── Dashboard ────────────────────────────────────────────────────────────────

final dashboardProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.watch(apiServiceProvider).getDashboard();
});

// ─── Classes ──────────────────────────────────────────────────────────────────

class ClassListNotifier extends StateNotifier<List<ClassInfo>> {
  final ApiService _api;
  ClassListNotifier(this._api) : super([]) { loadClasses(); }

  Future<void> loadClasses() async {
    state = await _api.getClasses();
  }
}

final classListProvider = StateNotifierProvider<ClassListNotifier, List<ClassInfo>>((ref) {
  return ClassListNotifier(ref.watch(apiServiceProvider));
});

// ─── Students ─────────────────────────────────────────────────────────────────

class StudentListNotifier extends StateNotifier<List<Student>> {
  final ApiService _api;
  final String classId;
  StudentListNotifier(this._api, this.classId) : super([]) { loadStudents(); }

  Future<void> loadStudents() async {
    state = await _api.getStudents(classId);
  }
}

final studentListProvider =
    StateNotifierProvider.family<StudentListNotifier, List<Student>, String>((ref, classId) {
  return StudentListNotifier(ref.watch(apiServiceProvider), classId);
});

// ─── Individual Student ───────────────────────────────────────────────────────

final studentByIdProvider = FutureProvider.family<Student?, String>((ref, studentId) async {
  return ref.watch(apiServiceProvider).getStudentById(studentId);
});

// ─── Student Overview (green/yellow/red) ──────────────────────────────────────

final studentOverviewProvider = FutureProvider<Map<String, List<StudentOverviewEntry>>>((ref) async {
  return ref.watch(apiServiceProvider).getOverview();
});

// ─── Notifications ────────────────────────────────────────────────────────────

class NotificationsNotifier extends StateNotifier<List<AppNotification>> {
  final ApiService _api;
  NotificationsNotifier(this._api) : super([]) { loadNotifications(); }

  Future<void> loadNotifications() async {
    final notifs = await _api.getNotifications();
    final notices = await _api.getNotices();
    
    final noticeNotifs = notices.map((n) {
      final p = switch (n.priority.toLowerCase()) {
        'urgent' => NotificationPriority.urgent,
        'reminder' => NotificationPriority.reminder,
        _ => NotificationPriority.info,
      };
      
      return AppNotification(
        id: 'notice_${n.id}',
        title: n.title,
        subtitle: n.body ?? 'School Notice',
        category: 'notice',
        priority: p,
        unread: false,
        timeAgo: _timeAgo(n.createdAt),
      );
    }).toList();

    state = [...notifs, ...noticeNotifs];
  }

  String _timeAgo(DateTime d) {
    final diff = DateTime.now().difference(d);
    if (diff.inDays > 0) return '${diff.inDays}d';
    if (diff.inHours > 0) return '${diff.inHours}h';
    return '${diff.inMinutes}m';
  }
}

final notificationsProvider =
    StateNotifierProvider<NotificationsNotifier, List<AppNotification>>((ref) {
  return NotificationsNotifier(ref.watch(apiServiceProvider));
});

// ─── Assessments ──────────────────────────────────────────────────────────────

class AssessmentsNotifier extends StateNotifier<List<Assessment>> {
  final ApiService _api;
  AssessmentsNotifier(this._api) : super([]) { loadAssessments(); }

  Future<void> loadAssessments() async {
    state = await _api.getAssessments();
  }
}

final assessmentsProvider =
    StateNotifierProvider<AssessmentsNotifier, List<Assessment>>((ref) {
  return AssessmentsNotifier(ref.watch(apiServiceProvider));
});

final assessmentTypesProvider = FutureProvider<List<AssessmentType>>((ref) async {
  return ref.watch(apiServiceProvider).getAssessmentTypes();
});

// ─── Chapters ─────────────────────────────────────────────────────────────────

class ChaptersNotifier extends StateNotifier<List<Chapter>> {
  final ApiService _api;
  final String classId;
  ChaptersNotifier(this._api, this.classId) : super([]) { loadChapters(); }

  Future<void> loadChapters() async {
    state = await _api.getChapters(classId);
  }
}

final chaptersProvider =
    StateNotifierProvider.family<ChaptersNotifier, List<Chapter>, String>((ref, classId) {
  return ChaptersNotifier(ref.watch(apiServiceProvider), classId);
});

// ─── Behaviour Metrics ────────────────────────────────────────────────────────

final behaviourMetricsProvider = FutureProvider<List<BehaviourMetric>>((ref) async {
  return ref.watch(apiServiceProvider).getBehaviourMetrics();
});

// ─── Student Marks History ────────────────────────────────────────────────────

class StudentMarksHistoryNotifier extends StateNotifier<List<Map<String, dynamic>>> {
  final ApiService _api;
  final String studentId;

  StudentMarksHistoryNotifier(this._api, this.studentId) : super([]) {
    loadMarks();
  }

  Future<void> loadMarks() async {
    final assessments = await _api.getStudentMarks(studentId);
    state = assessments;
  }

  void addMarkRecord({
    required String title,
    required String subject,
    required double score,
    required double maxMarks,
  }) {
    final newRecord = {
      'date': DateTime.now(),
      'title': title,
      'subject': subject,
      'score': score,
      'maxMarks': maxMarks,
      'percentage': (score / maxMarks) * 100.0,
    };
    state = [newRecord, ...state];
  }
}

final studentMarksHistoryProvider =
    StateNotifierProvider.family<StudentMarksHistoryNotifier, List<Map<String, dynamic>>, String>((ref, studentId) {
  return StudentMarksHistoryNotifier(ref.watch(apiServiceProvider), studentId);
});

// ─── Student Attendance History ───────────────────────────────────────────────

class StudentAttendanceHistoryNotifier extends StateNotifier<List<Map<String, dynamic>>> {
  final ApiService _api;
  final String studentId;

  StudentAttendanceHistoryNotifier(this._api, this.studentId) : super([]) {
    loadAttendance();
  }

  Future<void> loadAttendance() async {
    final records = await _api.getStudentAttendanceHistory(studentId);
    state = records;
  }
}

final studentAttendanceHistoryProvider =
    StateNotifierProvider.family<StudentAttendanceHistoryNotifier, List<Map<String, dynamic>>, String>((ref, studentId) {
  return StudentAttendanceHistoryNotifier(ref.watch(apiServiceProvider), studentId);
});

// ─── Student Behaviour Logs ───────────────────────────────────────────────────

class StudentBehaviourNotifier extends StateNotifier<List<BehaviourLog>> {
  final ApiService _api;
  final String studentId;

  StudentBehaviourNotifier(this._api, this.studentId) : super([]) {
    loadLogs();
  }

  Future<void> loadLogs() async {
    state = await _api.getBehaviourLogs(studentId);
  }

  Future<void> addLog(String preset, String kind, int metricId) async {
    final success = await _api.logBehaviour([studentId], metricId);
    if (success) await loadLogs();
  }
}

final studentBehaviourProvider =
    StateNotifierProvider.family<StudentBehaviourNotifier, List<BehaviourLog>, String>((ref, studentId) {
  return StudentBehaviourNotifier(ref.watch(apiServiceProvider), studentId);
});

// ─── Pending Tasks ────────────────────────────────────────────────────────────

class PendingTasksNotifier extends StateNotifier<List<PendingTask>> {
  final ApiService _api;
  PendingTasksNotifier(this._api) : super([]) { load(); }

  Future<void> load() async {
    state = await _api.getPendingTasks();
  }
}

final pendingTasksProvider =
    StateNotifierProvider<PendingTasksNotifier, List<PendingTask>>((ref) {
  return PendingTasksNotifier(ref.watch(apiServiceProvider));
});

// ─── School Notices ────────────────────────────────────────────────────────────

class NoticesNotifier extends StateNotifier<List<SchoolNotice>> {
  final ApiService _api;
  NoticesNotifier(this._api) : super([]) { load(); }

  Future<void> load() async {
    state = await _api.getNotices();
  }
}

final schoolNoticesProvider =
    StateNotifierProvider<NoticesNotifier, List<SchoolNotice>>((ref) {
  return NoticesNotifier(ref.watch(apiServiceProvider));
});

// ─── Demo Banner ──────────────────────────────────────────────────────────────

final demoBannerProvider = StateProvider<String?>((ref) => null);

// ─── Settings ─────────────────────────────────────────────────────────────────

class SettingsState {
  final bool notificationsEnabled;
  final String language;
  final bool syncWifiOnly;
  final bool offlineMode;

  const SettingsState({
    this.notificationsEnabled = true,
    this.language = 'English',
    this.syncWifiOnly = true,
    this.offlineMode = false,
  });

  SettingsState copyWith({
    bool? notificationsEnabled,
    String? language,
    bool? syncWifiOnly,
    bool? offlineMode,
  }) {
    return SettingsState(
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      language: language ?? this.language,
      syncWifiOnly: syncWifiOnly ?? this.syncWifiOnly,
      offlineMode: offlineMode ?? this.offlineMode,
    );
  }
}

class SettingsNotifier extends StateNotifier<SettingsState> {
  SettingsNotifier() : super(const SettingsState()) { _loadSettings(); }

  Future<void> _loadSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      state = SettingsState(
        notificationsEnabled: prefs.getBool('notificationsEnabled') ?? true,
        language: prefs.getString('language') ?? 'English',
        syncWifiOnly: prefs.getBool('syncWifiOnly') ?? true,
        offlineMode: prefs.getBool('offlineMode') ?? false,
      );
    } catch (_) {}
  }

  Future<void> setNotificationsEnabled(bool value) async {
    state = state.copyWith(notificationsEnabled: value);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('notificationsEnabled', value);
  }

  Future<void> setLanguage(String value) async {
    state = state.copyWith(language: value);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('language', value);
  }

  Future<void> setSyncWifiOnly(bool value) async {
    state = state.copyWith(syncWifiOnly: value);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('syncWifiOnly', value);
  }

  Future<void> setOfflineMode(bool value) async {
    state = state.copyWith(offlineMode: value);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('offlineMode', value);
  }
}

final settingsProvider = StateNotifierProvider<SettingsNotifier, SettingsState>((ref) {
  return SettingsNotifier();
});

final teacherPerformanceSummaryProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  return ref.watch(apiServiceProvider).getPerformanceSummary();
});
