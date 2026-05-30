import 'package:flutter/material.dart';

class AppColors {
  static const blue = Color(0xFF2563EB);
  static const green = Color(0xFF10B981);
  static const yellow = Color(0xFFF59E0B);
  static const red = Color(0xFFEF4444);
  static const bg = Color(0xFFF8FAFC);
  static const ink = Color(0xFF0F172A);
  static const muted = Color(0xFF64748B);
  static const lineSoft = Color(0xFFCBD5E1);
  static const lineFaint = Color(0xFFE2E8F0);
}

class AppTheme {
  static ThemeData get lightTheme {
    const colorScheme = ColorScheme(
      brightness: Brightness.light,
      primary: AppColors.blue,
      onPrimary: Colors.white,
      secondary: AppColors.green,
      onSecondary: Colors.white,
      error: AppColors.red,
      onError: Colors.white,
      surface: Colors.white,
      onSurface: AppColors.ink,
    );

    return ThemeData(
      colorScheme: colorScheme,
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.bg,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: AppColors.ink,
        elevation: 0,
        centerTitle: false,
        surfaceTintColor: Colors.transparent,
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: const BorderSide(color: AppColors.lineFaint),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.blue,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          minimumSize: const Size.fromHeight(44),
          textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
        ),
      ),
      chipTheme: const ChipThemeData(
        shape: StadiumBorder(),
        side: BorderSide.none,
        padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      ),
    );
  }
}
