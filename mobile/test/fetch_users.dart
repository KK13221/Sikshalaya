import 'dart:io';
import 'package:dio/dio.dart';

void main() async {
  final dio = Dio(BaseOptions(
    baseUrl: 'http://168.144.121.95/api',
  ));

  print('Authenticating as principal...');
  try {
    final loginResponse = await dio.post('/auth/login', data: {
      'email': 'principal.gurugram@shikshalaya.in',
      'password': 'Principal@123',
    });

    if (loginResponse.statusCode == 200 && loginResponse.data != null) {
      final token = loginResponse.data['token'];
      print('Token obtained: $token');

      dio.options.headers['Authorization'] = 'Bearer $token';

      print('\n--- Querying /users ---');
      try {
        final usersRes = await dio.get('/users');
        print('Users status: ${usersRes.statusCode}');
        print('Users data type: ${usersRes.data.runtimeType}');
        print('Users: ${usersRes.data}');
      } catch (e) {
        print('Failed to get /users: $e');
      }

      print('\n--- Querying /teachers ---');
      try {
        final teachersRes = await dio.get('/teachers');
        print('Teachers status: ${teachersRes.statusCode}');
        print('Teachers data type: ${teachersRes.data.runtimeType}');
        print('Teachers: ${teachersRes.data}');
      } catch (e) {
        print('Failed to get /teachers: $e');
      }
    } else {
      print('Failed to authenticate');
    }
  } catch (e) {
    print('Error occurred: $e');
  }
}
