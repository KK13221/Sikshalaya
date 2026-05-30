import 'dart:io';
import 'package:studentlens_teacher_app/data/services/api_service.dart';
import 'package:studentlens_teacher_app/models/app_models.dart';

// Standalone mock to bypass Native MethodChannels on Host VM
class TestApiService extends ApiService {
  String? _token;

  @override
  Future<String?> getToken() async => _token;

  @override
  Future<void> saveToken(String token) async {
    _token = token;
  }

  @override
  Future<void> deleteToken() async {
    _token = null;
  }
}

Future<void> main() async {
  print('========================================================');
  print('      STUDENTLENS API INTEGRATION VERIFIER               ');
  print('========================================================\n');

  final api = TestApiService();

  try {
    // 1. Login Test
    print('[TEST 1/6] Authenticating credentials...');
    final user = await api.login(
      'principal.gurugram@shikshalaya.in',
      'Principal@123',
    );

    if (user == null) {
      print('❌ FAILED: Login returned null. Please check server or credentials.');
      exit(1);
    }
    print('✅ SUCCESS: Direct login — JWT stored.');
    print('   - User: ${user.name}\n');

    // 2. Fetch User Info Test
    print('[TEST 2/6] Verifying user profile retrieval (/auth/me)...');
    final profile = await api.getCurrentUser();
    if (profile == null) {
      print('❌ FAILED: Profile retrieval returned null.');
      exit(1);
    }
    print('✅ SUCCESS: Profile fetched: ${profile.name} (${profile.role})\n');

    // 3. Fetch Classes Test
    print('[TEST 3/6] Fetching assigned classes...');
    final classes = await api.getClasses();
    print('✅ SUCCESS: Loaded ${classes.length} classes.');
    for (var c in classes) {
      print('   - [Class ${c.id}] Name: ${c.name} | Subject: ${c.subject} | Students: ${c.students} | Avg Attendance: ${c.attendancePercent}%');
    }
    print('');

    if (classes.isEmpty) {
      print('⚠️ WARNING: No classes assigned to this account. Skipping student/assessment details.');
      exit(0);
    }

    // 4. Fetch Students Test
    final targetClass = classes.first;
    print('[TEST 4/6] Fetching students for Class: ${targetClass.name}...');
    final students = await api.getStudents(targetClass.id);
    print('✅ SUCCESS: Loaded ${students.length} students.');
    if (students.isNotEmpty) {
      final sample = students.first;
      print('   - Sample Student: Name: ${sample.name} | Roll/Admission: ${sample.roll} | Performance: ${sample.isUnderperformer ? "⚠️ Underperformer" : "Good"}');
    }
    print('');

    // 5. Fetch Assessments Test
    print('[TEST 5/6] Fetching active assessments...');
    final assessments = await api.getAssessments();
    print('✅ SUCCESS: Loaded ${assessments.length} assessments.');
    if (assessments.isNotEmpty) {
      final sample = assessments.first;
      print('   - Sample Assessment: Title: ${sample.title} | Max Marks: ${sample.maxMarks} | Status: ${sample.status}');
    }
    print('');

    // 6. Fetch Notifications Test
    print('[TEST 6/6] Fetching alerts & notifications...');
    final notifications = await api.getNotifications();
    print('✅ SUCCESS: Loaded ${notifications.length} notifications.');
    if (notifications.isNotEmpty) {
      final sample = notifications.first;
      print('   - Sample Alert: "${sample.title}" (${sample.timeAgo}) | Priority: ${sample.priority}');
    }
    print('');

    print('========================================================');
    print('🎉 ALL API INTEGRATION TESTS PASSED SUCCESSFULLY!       ');
    print('========================================================');
  } catch (e) {
    print('❌ TEST SUITE ENCOUNTERED AN UNEXPECTED EXCEPTION:');
    print(e);
    exit(1);
  }
}

int min(int a, int b) => a < b ? a : b;
