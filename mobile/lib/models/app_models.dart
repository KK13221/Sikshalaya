class TeacherUser {
  final String id;
  final String name;
  final String email;
  final String role;
  final int? schoolId;
  final String branch;
  final List<String> teaches; // classIds this teacher is assigned to
  final String? principalName;
  final String? principalEmail;
  final String? superAdminName;
  final String? superAdminEmail;
  final int greenThreshold;
  final int yellowThreshold;
  final String? teacherNorms;
  final int teacherNormsVersion;
  final int normsAcceptedVersion;
  final String? normsAcceptedAt;
  final bool requiresNormsAcceptance;

  const TeacherUser({
    required this.id,
    required this.name,
    required this.email,
    this.role = '',
    this.schoolId,
    required this.branch,
    this.teaches = const [],
    this.principalName,
    this.principalEmail,
    this.superAdminName,
    this.superAdminEmail,
    this.greenThreshold = 75,
    this.yellowThreshold = 50,
    this.teacherNorms,
    this.teacherNormsVersion = 0,
    this.normsAcceptedVersion = 0,
    this.normsAcceptedAt,
    this.requiresNormsAcceptance = false,
  });

  factory TeacherUser.fromJson(Map<String, dynamic> json) {
    // Use schoolName from API if present, otherwise fall back to schoolId
    final schoolName = json['schoolName'] as String?;
    final schoolId = json['schoolId'];
    String branch = 'My School';
    if (schoolName != null && schoolName.isNotEmpty) {
      branch = schoolName;
    } else if (schoolId != null) {
      branch = 'School #$schoolId';
    }
    
    final principal = json['principal'] as Map<String, dynamic>?;
    final superadmin = json['superadmin'] as Map<String, dynamic>?;

    return TeacherUser(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? '',
      schoolId: schoolId,
      branch: branch,
      teaches: const [],
      principalName: principal?['name'] as String?,
      principalEmail: principal?['email'] as String?,
      superAdminName: superadmin?['name'] as String?,
      superAdminEmail: superadmin?['email'] as String?,
      greenThreshold: json['settings']?['greenThreshold'] as int? ?? 75,
      yellowThreshold: json['settings']?['yellowThreshold'] as int? ?? 50,
      teacherNorms: json['teacherNorms'] as String?,
      teacherNormsVersion: json['teacherNormsVersion'] as int? ?? 0,
      normsAcceptedVersion: json['normsAcceptedVersion'] as int? ?? 0,
      normsAcceptedAt: json['normsAcceptedAt'] as String?,
      requiresNormsAcceptance: json['requiresNormsAcceptance'] as bool? ?? false,
    );
  }

  TeacherUser copyWith({
    String? id,
    String? name,
    String? email,
    String? role,
    int? schoolId,
    String? branch,
    List<String>? teaches,
    String? principalName,
    String? principalEmail,
    String? superAdminName,
    String? superAdminEmail,
    int? greenThreshold,
    int? yellowThreshold,
    String? teacherNorms,
    int? teacherNormsVersion,
    int? normsAcceptedVersion,
    String? normsAcceptedAt,
    bool? requiresNormsAcceptance,
  }) {
    return TeacherUser(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      role: role ?? this.role,
      schoolId: schoolId ?? this.schoolId,
      branch: branch ?? this.branch,
      teaches: teaches ?? this.teaches,
      principalName: principalName ?? this.principalName,
      principalEmail: principalEmail ?? this.principalEmail,
      superAdminName: superAdminName ?? this.superAdminName,
      superAdminEmail: superAdminEmail ?? this.superAdminEmail,
      greenThreshold: greenThreshold ?? this.greenThreshold,
      yellowThreshold: yellowThreshold ?? this.yellowThreshold,
      teacherNorms: teacherNorms ?? this.teacherNorms,
      teacherNormsVersion: teacherNormsVersion ?? this.teacherNormsVersion,
      normsAcceptedVersion: normsAcceptedVersion ?? this.normsAcceptedVersion,
      normsAcceptedAt: normsAcceptedAt ?? this.normsAcceptedAt,
      requiresNormsAcceptance: requiresNormsAcceptance ?? this.requiresNormsAcceptance,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is TeacherUser && id == other.id;

  @override
  int get hashCode => id.hashCode;
}

class ClassInfo {
  final String id;
  final String name;
  final String subject;
  final List<String> subjectList;
  final int students;
  final int attendancePercent;
  final String? classTeacherName;

  const ClassInfo({
    required this.id,
    required this.name,
    required this.subject,
    this.subjectList = const [],
    required this.students,
    required this.attendancePercent,
    this.classTeacherName,
  });

  factory ClassInfo.fromJson(Map<String, dynamic> json) {
    final subjects = List<String>.from(json['subjects'] ?? []);
    final teacher = json['classTeacher'] as Map<String, dynamic>?;
    return ClassInfo(
      id: json['id']?.toString() ?? '',
      name: '${json['name'] ?? ''} ${json['section'] ?? ''}'.trim(),
      subject: subjects.isNotEmpty ? subjects.join(', ') : 'General',
      subjectList: subjects.isNotEmpty ? subjects : ['General'],
      students: (json['studentCount'] ?? json['totalStudents'] ?? json['students'] ?? 0) as int,
      attendancePercent: (json['attendancePercent'] ?? 90) as int,
      classTeacherName: teacher?['name'] as String?,
    );
  }

  ClassInfo copyWith({
    String? id,
    String? name,
    String? subject,
    List<String>? subjectList,
    int? students,
    int? attendancePercent,
    String? classTeacherName,
  }) {
    return ClassInfo(
      id: id ?? this.id,
      name: name ?? this.name,
      subject: subject ?? this.subject,
      subjectList: subjectList ?? this.subjectList,
      students: students ?? this.students,
      attendancePercent: attendancePercent ?? this.attendancePercent,
      classTeacherName: classTeacherName ?? this.classTeacherName,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is ClassInfo && id == other.id;

  @override
  int get hashCode => id.hashCode;
}

class StudentOverviewEntry {
  final String id;
  final String name;
  final String? rollNo;
  final String? admissionNo;
  final double academicsPct;
  final double punctualityPct;
  final double? behaviourScore;
  final int combinedScore;
  final String? className;
  final String category; // 'green' | 'yellow' | 'red'

  const StudentOverviewEntry({
    required this.id,
    required this.name,
    this.rollNo,
    this.admissionNo,
    required this.academicsPct,
    required this.punctualityPct,
    this.behaviourScore,
    required this.combinedScore,
    this.className,
    required this.category,
  });

  factory StudentOverviewEntry.fromJson(Map<String, dynamic> json, String category) {
    return StudentOverviewEntry(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      rollNo: json['rollNo']?.toString(),
      admissionNo: json['admissionNo']?.toString(),
      academicsPct: (json['academicsPct'] as num?)?.toDouble() ?? 0,
      punctualityPct: (json['punctualityPct'] as num?)?.toDouble() ?? 0,
      behaviourScore: (json['behaviourScore'] as num?)?.toDouble(),
      combinedScore: (json['combinedScore'] as num?)?.toInt() ?? 0,
      className: json['class'] as String?,
      category: category,
    );
  }
}

class BehaviourMetric {
  final int id;
  final String name;
  final String kind; // 'positive' | 'negative'
  final int weight;
  final String category; // 'behaviour' | 'academic'

  const BehaviourMetric({
    required this.id,
    required this.name,
    required this.kind,
    required this.weight,
    required this.category,
  });

  factory BehaviourMetric.fromJson(Map<String, dynamic> json) {
    return BehaviourMetric(
      id: json['id'] as int,
      name: json['name'] ?? '',
      kind: json['kind'] ?? 'positive',
      weight: (json['weight'] as num?)?.toInt() ?? 0,
      category: json['category'] ?? 'behaviour',
    );
  }
}

class Student {
  final String id;
  final String name;
  final String roll;
  final String classSection; // e.g. "9-B"
  final int? age;
  final double? academicsPct;
  final double? punctualityPct;
  final double? behaviourScore;
  final bool isUnderperformer;
  final List<String> flaggedDims; // e.g. ["academics", "behaviour"]
  final String? guardianName;
  final String? guardianRelation;
  final String? guardianPhone;
  final String? guardianEmail;

  const Student({
    required this.id,
    required this.name,
    required this.roll,
    this.classSection = '',
    this.age,
    this.academicsPct,
    this.punctualityPct,
    this.behaviourScore,
    this.isUnderperformer = false,
    this.flaggedDims = const [],
    this.guardianName,
    this.guardianRelation,
    this.guardianPhone,
    this.guardianEmail,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    final dims = List<String>.from(json['underperformerDims'] ?? []);
    return Student(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      roll: json['rollNo'] != null ? '#${json['rollNo']}' : (json['admissionNo'] ?? ''),
      classSection: json['section'] ?? '',
      age: json['dateOfBirth'] != null ? _calculateAge(json['dateOfBirth']) : null,
      academicsPct: (json['academicsPct'] as num?)?.toDouble(),
      punctualityPct: (json['punctualityPct'] as num?)?.toDouble(),
      behaviourScore: (json['behaviourScore'] as num?)?.toDouble(),
      isUnderperformer: json['isUnderperformer'] ?? false,
      flaggedDims: dims,
      guardianName: json['guardianName'],
      guardianRelation: json['guardianRelation'],
      guardianPhone: json['guardianPhone'],
      guardianEmail: json['guardianEmail'],
    );
  }

  static int? _calculateAge(String dobStr) {
    try {
      final dob = DateTime.parse(dobStr);
      final today = DateTime.now();
      int age = today.year - dob.year;
      if (today.month < dob.month || (today.month == dob.month && today.day < dob.day)) {
        age--;
      }
      return age;
    } catch (_) {
      return null;
    }
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is Student && id == other.id;

  @override
  int get hashCode => id.hashCode;
}

enum NotificationPriority { urgent, reminder, parent, info }

class AppNotification {
  final String id;
  final String title;
  final String subtitle;
  final String category; // underperformer | attendance_overdue | marks_due | parent_message | chapter_scheduled
  final NotificationPriority priority;
  final bool unread;
  final String timeAgo;

  const AppNotification({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.category,
    required this.priority,
    required this.unread,
    required this.timeAgo,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    final priorityStr = json['priority'] ?? 'info';
    NotificationPriority priorityVal;
    switch (priorityStr) {
      case 'urgent': priorityVal = NotificationPriority.urgent; break;
      case 'reminder': priorityVal = NotificationPriority.reminder; break;
      case 'parent': priorityVal = NotificationPriority.parent; break;
      default: priorityVal = NotificationPriority.info;
    }
    
    // Calculate nice time ago
    String timeAgo = '10m';
    if (json['createdAt'] != null) {
      try {
        final created = DateTime.parse(json['createdAt']);
        final diff = DateTime.now().difference(created);
        if (diff.inMinutes < 60) {
          timeAgo = '${diff.inMinutes}m';
        } else if (diff.inHours < 24) {
          timeAgo = '${diff.inHours}h';
        } else {
          timeAgo = '${diff.inDays}d';
        }
      } catch (_) {}
    }

    return AppNotification(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      subtitle: json['body'] ?? '',
      category: json['category'] ?? 'info',
      priority: priorityVal,
      unread: !(json['isRead'] ?? false),
      timeAgo: timeAgo,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is AppNotification && id == other.id;

  @override
  int get hashCode => id.hashCode;
}

class Assessment {
  final String id;
  final String title;
  final String type; // chapter_test | class_test | unit_test | term_exam
  final String status; // draft | scheduled | active | completed | published
  final int maxMarks;
  final int passMarks;
  final String subject;
  final String classSection;

  const Assessment({
    required this.id,
    required this.title,
    required this.type,
    required this.status,
    required this.maxMarks,
    required this.passMarks,
    required this.subject,
    required this.classSection,
  });

  factory Assessment.fromJson(Map<String, dynamic> json) {
    return Assessment(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      type: json['type'] ?? 'class_test',
      status: json['status'] ?? 'draft',
      maxMarks: json['maxMarks'] ?? 0,
      passMarks: json['passMarks'] ?? 0,
      subject: json['subjectId'] ?? 'General',
      classSection: '${json['classNum'] ?? ''}-${json['section'] ?? ''}',
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is Assessment && id == other.id;

  @override
  int get hashCode => id.hashCode;
}

class Chapter {
  final String id;
  final int number;
  final String name;
  final String subject;
  final int periods;
  final bool hasChapterTest;
  final String status; // upcoming | in_progress | done

  const Chapter({
    required this.id,
    required this.number,
    required this.name,
    this.subject = 'General',
    required this.periods,
    this.hasChapterTest = true,
    this.status = 'upcoming',
  });

  factory Chapter.fromJson(Map<String, dynamic> json) {
    return Chapter(
      id: json['id']?.toString() ?? '',
      number: json['chapterNumber'] ?? 1,
      name: json['name'] ?? '',
      subject: json['subjectId']?.toString() ?? 'General',
      periods: json['periods'] ?? 0,
      hasChapterTest: json['hasChapterTest'] ?? false,
      status: json['status'] ?? 'upcoming',
    );
  }
}

class PendingTask {
  final String id;
  final String type; // 'attendance' | 'marks' | 'underperformer'
  final String priority; // 'urgent' | 'reminder'
  final String title;
  final String actionRoute;

  const PendingTask({
    required this.id,
    required this.type,
    required this.priority,
    required this.title,
    required this.actionRoute,
  });

  factory PendingTask.fromJson(Map<String, dynamic> json) {
    return PendingTask(
      id: json['id']?.toString() ?? '',
      type: json['type'] ?? 'info',
      priority: json['priority'] ?? 'info',
      title: json['title'] ?? '',
      actionRoute: json['actionRoute'] ?? '/',
    );
  }
}

class SchoolNotice {
  final String id;
  final String title;
  final String? body;
  final String priority; // 'urgent' | 'info' | 'reminder'
  final String audience;
  final DateTime createdAt;

  const SchoolNotice({
    required this.id,
    required this.title,
    this.body,
    required this.priority,
    required this.audience,
    required this.createdAt,
  });

  factory SchoolNotice.fromJson(Map<String, dynamic> json) {
    return SchoolNotice(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      body: json['body'] as String?,
      priority: json['priority'] ?? 'info',
      audience: json['audience'] ?? 'All teachers',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}

class BehaviourLog {
  final String id;
  final String studentId;
  final String teacherId;
  final String preset; // Helpful | Leadership | Homework incomplete | Late arrival | Disruptive | Custom
  final String kind; // '+' or '-'
  final DateTime loggedAt;

  const BehaviourLog({
    required this.id,
    required this.studentId,
    required this.teacherId,
    required this.preset,
    required this.kind,
    required this.loggedAt,
  });

  factory BehaviourLog.fromJson(Map<String, dynamic> json) {
    final kindRaw = json['kind'] ?? 'positive';
    return BehaviourLog(
      id: json['id']?.toString() ?? '',
      studentId: json['studentId']?.toString() ?? '',
      teacherId: json['loggedBy']?.toString() ?? '',
      preset: json['preset']?.toString() ?? 'Custom',
      kind: kindRaw == 'positive' ? '+' : '-',
      loggedAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : (json['date'] != null ? DateTime.parse(json['date']) : DateTime.now()),
    );
  }
}

class AssessmentType {
  final String code;
  final String label;
  final String sublabel;
  final String color;

  const AssessmentType({
    required this.code,
    required this.label,
    required this.sublabel,
    required this.color,
  });

  factory AssessmentType.fromJson(Map<String, dynamic> json) {
    return AssessmentType(
      code: json['code']?.toString() ?? '',
      label: json['label']?.toString() ?? '',
      sublabel: json['sublabel']?.toString() ?? '',
      color: json['color']?.toString() ?? 'blue',
    );
  }
}
