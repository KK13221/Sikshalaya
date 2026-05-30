import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../models/app_models.dart';

class ApiService {
  final Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  // Override at build time: flutter build apk --dart-define=API_BASE_URL=http://your-server/api
  // Defaults to the production server when not overridden.
  static const String _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://168.144.121.95/api',
  );
  static const String _tokenKey = 'jwt_token';

  ApiService()
      : _dio = Dio(BaseOptions(
          baseUrl: _baseUrl,
          connectTimeout: const Duration(seconds: 15),
          receiveTimeout: const Duration(seconds: 15),
        )) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) {
          return handler.next(e);
        },
      ),
    );
  }

  // ─── Token ────────────────────────────────────────────────────────────────

  Future<String?> getToken() async => await _storage.read(key: _tokenKey);
  Future<void> saveToken(String token) async => await _storage.write(key: _tokenKey, value: token);
  Future<void> deleteToken() async => await _storage.delete(key: _tokenKey);

  // ─── Auth ─────────────────────────────────────────────────────────────────

  Future<TeacherUser?> login(String email, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email.trim().toLowerCase(),
        'password': password.trim(),
      });
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        if (data['success'] == true) {
          if (data['token'] != null) {
            await saveToken(data['token'] as String);
            if (data['user'] != null) {
              return TeacherUser.fromJson(data['user'] as Map<String, dynamic>);
            }
          }
        }
      }
    } catch (e) {
      print('Login error: $e');
    }
    return null;
  }


  Future<TeacherUser?> getCurrentUser() async {
    try {
      final response = await _dio.get('/auth/me');
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        final userData = data['data'] ?? data['user'];
        if (userData != null) {
          return TeacherUser.fromJson(userData as Map<String, dynamic>);
        }
      }
    } catch (e) {
      print('GetCurrentUser error: $e');
    }
    return null;
  }

  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } catch (_) {}
    await deleteToken();
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> getDashboard() async {
    try {
      final response = await _dio.get('/dashboard/principal');
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        return Map<String, dynamic>.from(data['data'] ?? data);
      }
    } catch (e) {
      print('GetDashboard error: $e');
    }
    return {};
  }

  // ─── Classes ──────────────────────────────────────────────────────────────

  Future<List<ClassInfo>> getClasses() async {
    try {
      final response = await _dio.get('/teachers/me/classes');
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        if (data['success'] == true && data['data'] != null) {
          return (data['data'] as List)
              .map((item) => ClassInfo.fromJson(item as Map<String, dynamic>))
              .toList();
        }
      }
    } catch (e) {
      print('GetClasses error: $e');
    }
    return [];
  }

  Future<ClassInfo?> getClassById(String classId) async {
    try {
      final response = await _dio.get('/classes/$classId');
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        if (data['success'] == true && data['data'] != null) {
          return ClassInfo.fromJson(data['data'] as Map<String, dynamic>);
        }
      }
    } catch (e) {
      print('GetClassById error: $e');
    }
    return null;
  }

  // ─── Students ─────────────────────────────────────────────────────────────

  Future<List<Student>> getStudents(String classId) async {
    try {
      final response = await _dio.get('/teachers/me/students',
          queryParameters: {'classId': classId});
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        if (data['success'] == true && data['data'] != null) {
          return (data['data'] as List)
              .map((item) => Student.fromJson(item as Map<String, dynamic>))
              .toList();
        }
      }
    } catch (e) {
      print('GetStudents error: $e');
    }
    return [];
  }

  Future<Student?> getStudentById(String studentId) async {
    try {
      final response = await _dio.get('/students/$studentId');
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        final studentData = data['data'] ?? data['student'];
        if (studentData != null) {
          return Student.fromJson(studentData as Map<String, dynamic>);
        }
      }
    } catch (e) {
      print('GetStudentById error: $e');
    }
    return null;
  }

  // ─── Attendance ───────────────────────────────────────────────────────────

  Future<List<dynamic>> getAttendance(String classId, {String? date}) async {
    try {
      final params = <String, dynamic>{'classId': classId};
      if (date != null) params['date'] = date;
      final response = await _dio.get('/teachers/me/attendance', queryParameters: params);
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        if (data['success'] == true && data['data'] != null) {
          return data['data'] as List;
        }
      }
    } catch (e) {
      print('GetAttendance error: $e');
    }
    return [];
  }

  Future<bool> saveAttendance(String classId, String date, List<Map<String, dynamic>> records) async {
    try {
      final response = await _dio.post('/teachers/me/attendance', data: {
        'classId': classId,
        'date': date,
        'records': records,
      });
      return response.statusCode == 200;
    } catch (e) {
      print('SaveAttendance error: $e');
      return false;
    }
  }

  // ─── Assessments / Marks ──────────────────────────────────────────────────

  Future<List<Assessment>> getAssessments({String? classId}) async {
    try {
      final params = classId != null ? {'classId': classId} : null;
      final response = await _dio.get('/teachers/me/assessments', queryParameters: params);
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        if (data['success'] == true && data['data'] != null) {
          return (data['data'] as List)
              .map((item) => Assessment.fromJson(item as Map<String, dynamic>))
              .toList();
        }
      }
    } catch (e) {
      print('GetAssessments error: $e');
    }
    return [];
  }

  Future<bool> saveMark(String assessmentId, String studentId, double marks, bool isAbsent) async {
    try {
      final response = await _dio.patch(
        '/assessments/$assessmentId/marks/$studentId',
        data: {
          'marksObtained': marks,
          'isAbsent': isAbsent,
          'tags': [],
          'note': '',
        },
      );
      return response.statusCode == 200;
    } catch (e) {
      print('SaveMark error: $e');
      return false;
    }
  }

  Future<List<Map<String, dynamic>>> getStudentMarks(String studentId) async {
    try {
      final response = await _dio.get('/assessments',
          queryParameters: {'studentId': studentId});
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        if (data['success'] == true && data['data'] != null) {
          return List<Map<String, dynamic>>.from(data['data'] as List);
        }
      }
    } catch (e) {
      print('GetStudentMarks error: $e');
    }
    return [];
  }

  // ─── Student Attendance History ───────────────────────────────────────────

  Future<List<Map<String, dynamic>>> getStudentAttendanceHistory(String studentId) async {
    try {
      final response = await _dio.get('/attendance',
          queryParameters: {'studentId': studentId});
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        if (data['success'] == true && data['data'] != null) {
          return List<Map<String, dynamic>>.from(data['data'] as List);
        }
      }
    } catch (e) {
      print('GetStudentAttendanceHistory error: $e');
    }
    return [];
  }

  // ─── Behaviour Logs ───────────────────────────────────────────────────────

  Future<List<BehaviourLog>> getBehaviourLogs(String studentId) async {
    try {
      final response = await _dio.get('/behaviour/logs',
          queryParameters: {'studentId': studentId});
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        if (data['success'] == true && data['data'] != null) {
          return (data['data'] as List)
              .map((e) => BehaviourLog.fromJson(e as Map<String, dynamic>))
              .toList();
        }
      }
    } catch (e) {
      print('GetBehaviourLogs error: $e');
    }
    return [];
  }

  Future<bool> logBehaviour(List<String> studentIds, int metricId, {String? note}) async {
    try {
      final response = await _dio.post('/behaviour/logs', data: {
        'studentIds': studentIds.map(int.parse).toList(),
        'metricId': metricId,
        'note': note ?? '',
      });
      return response.statusCode == 201;
    } catch (e) {
      print('LogBehaviour error: $e');
      return false;
    }
  }

  // ─── Notifications ────────────────────────────────────────────────────────

  Future<List<AppNotification>> getNotifications() async {
    try {
      final response = await _dio.get('/teachers/me/notifications');
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        if (data['success'] == true && data['data'] != null) {
          return (data['data'] as List)
              .map((item) => AppNotification.fromJson(item as Map<String, dynamic>))
              .toList();
        }
      }
    } catch (e) {
      print('GetNotifications error: $e');
    }
    return [];
  }

  // ─── Student Overview (green / yellow / red) ──────────────────────────────

  Future<Map<String, List<StudentOverviewEntry>>> getOverview() async {
    try {
      final response = await _dio.get('/students/overview');
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data['data'] as Map<String, dynamic>;
        return {
          'green':  (data['green']  as List).map((e) => StudentOverviewEntry.fromJson(e as Map<String, dynamic>, 'green')).toList(),
          'yellow': (data['yellow'] as List).map((e) => StudentOverviewEntry.fromJson(e as Map<String, dynamic>, 'yellow')).toList(),
          'red':    (data['red']    as List).map((e) => StudentOverviewEntry.fromJson(e as Map<String, dynamic>, 'red')).toList(),
        };
      }
    } catch (e) {
      print('GetOverview error: $e');
    }
    return {'green': [], 'yellow': [], 'red': []};
  }

  // ─── Behaviour Metrics ────────────────────────────────────────────────────

  Future<List<BehaviourMetric>> getBehaviourMetrics() async {
    try {
      final response = await _dio.get('/behaviour-metrics');
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        if (data['success'] == true && data['data'] != null) {
          return (data['data'] as List)
              .map((e) => BehaviourMetric.fromJson(e as Map<String, dynamic>))
              .toList();
        }
      }
    } catch (e) {
      print('GetBehaviourMetrics error: $e');
    }
    return [];
  }

  // ─── Pending Tasks ────────────────────────────────────────────────────────

  Future<List<PendingTask>> getPendingTasks() async {
    try {
      final response = await _dio.get('/teachers/me/pending-tasks');
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        if (data['success'] == true && data['data'] != null) {
          return (data['data'] as List)
              .map((e) => PendingTask.fromJson(e as Map<String, dynamic>))
              .toList();
        }
      }
    } catch (e) {
      print('GetPendingTasks error: $e');
    }
    return [];
  }

  // ─── Notices ──────────────────────────────────────────────────────────────

  Future<List<SchoolNotice>> getNotices() async {
    try {
      final response = await _dio.get('/notices');
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        if (data['success'] == true && data['data'] != null) {
          return (data['data'] as List)
              .map((e) => SchoolNotice.fromJson(e as Map<String, dynamic>))
              .toList();
        }
      }
    } catch (e) {
      print('GetNotices error: $e');
    }
    return [];
  }

  // ─── Chapters ─────────────────────────────────────────────────────────────

  Future<List<Chapter>> getChapters(String classId) async {
    try {
      final response = await _dio.get('/teachers/me/chapters',
          queryParameters: {'classId': classId});
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        if (data['success'] == true && data['data'] != null) {
          return (data['data'] as List)
              .map((item) => Chapter.fromJson(item as Map<String, dynamic>))
              .toList();
        }
      }
    } catch (e) {
      print('GetChapters error: $e');
    }
    return [];
  }
}


