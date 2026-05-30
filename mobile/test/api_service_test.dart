import 'dart:io';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:studentlens_teacher_app/data/services/api_service.dart';
import 'package:studentlens_teacher_app/models/app_models.dart';

void main() {
  // Setup Mock Flutter Secure Storage
  final Map<String, String> secureStorageValues = {};

  setUpAll(() {
    TestWidgetsFlutterBinding.ensureInitialized();

    // Disable Flutter's test HTTP client override to allow real integration requests
    HttpOverrides.global = null;

    // Mock the flutter_secure_storage method channel
    const channel = MethodChannel('plugins.it_nomads.com/flutter_secure_storage');
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(channel, (MethodCall methodCall) async {
      switch (methodCall.method) {
        case 'write':
          final key = methodCall.arguments['key'] as String;
          final value = methodCall.arguments['value'] as String;
          secureStorageValues[key] = value;
          return true;
        case 'read':
          final key = methodCall.arguments['key'] as String;
          return secureStorageValues[key];
        case 'delete':
          final key = methodCall.arguments['key'] as String;
          secureStorageValues.remove(key);
          return true;
        case 'clear':
          secureStorageValues.clear();
          return true;
        default:
          return null;
      }
    });
  });

  group('ApiService Integration Tests', () {
    late ApiService apiService;

    setUp(() {
      secureStorageValues.clear();
      apiService = ApiService();
    });

    Future<void> loginAndVerify() async {
      await apiService.login(
        'principal.gurugram@shikshalaya.in',
        'Principal@123',
      );
    }

    test('1. Test Authentication — login returns TeacherUser', () async {
      print('Testing login...');
      final user = await apiService.login(
        'principal.gurugram@shikshalaya.in',
        'Principal@123',
      );

      expect(user, isNotNull);
      print('✓ Direct login success: JWT stored, user=${user!.name}');
    });

    test('2. Test Profile Info (/users/me)', () async {
      print('Testing /users/me profile fetch...');
      // Login first
      await loginAndVerify();

      final user = await apiService.getCurrentUser();
      expect(user, isNotNull);
      expect(user!.email, equals('principal.gurugram@shikshalaya.in'));
      print('✓ Profile Fetch Success: User name: ${user.name}');
    });

    test('3. Test Fetch Classes', () async {
      print('Testing fetching classes...');
      // Login first
      await loginAndVerify();

      final classes = await apiService.getClasses();
      expect(classes, isNotNull);
      print('✓ Classes Loaded: Total count: ${classes.length}');
      for (var c in classes) {
        print('  - Class ID: ${c.id}, Name: ${c.name}, Subject: ${c.subject}, Students: ${c.students}, Attendance: ${c.attendancePercent}%');
        expect(c.id, isNotEmpty);
        expect(c.name, isNotEmpty);
      }
    });

    test('4. Test Fetch Students for the First Class', () async {
      print('Testing fetching students...');
      // Login first
      await loginAndVerify();

      final classes = await apiService.getClasses();
      expect(classes, isNotEmpty);

      final targetClass = classes.first;
      print('Fetching students for target class ${targetClass.name}...');
      final students = await apiService.getStudents(targetClass.id);

      expect(students, isNotNull);
      print('✓ Students Loaded: Count in class: ${students.length}');
      if (students.isNotEmpty) {
        final sample = students.first;
        print('  - Sample Student: ID: ${sample.id}, Name: ${sample.name}, Roll: ${sample.roll}');
        expect(sample.id, isNotEmpty);
        expect(sample.name, isNotEmpty);
      }
    });

    test('5. Test Fetch Assessments', () async {
      print('Testing fetching assessments...');
      // Login first
      await loginAndVerify();

      final assessments = await apiService.getAssessments();
      expect(assessments, isNotNull);
      print('✓ Assessments Loaded: Count: ${assessments.length}');
      if (assessments.isNotEmpty) {
        final sample = assessments.first;
        print('  - Sample Assessment: ID: ${sample.id}, Title: ${sample.title}, Max Marks: ${sample.maxMarks}');
        expect(sample.id, isNotEmpty);
        expect(sample.title, isNotEmpty);
      }
    });

    test('6. Test Fetch Notifications', () async {
      print('Testing fetching notifications...');
      // Login first
      await loginAndVerify();

      final notifications = await apiService.getNotifications();
      expect(notifications, isNotNull);
      print('✓ Notifications Loaded: Count: ${notifications.length}');
    });
  });
}
