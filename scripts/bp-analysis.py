#!/usr/bin/env python3
"""
Blood Pressure Analysis Script
Demonstrates the core logic for analyzing BP readings and providing health advice
"""

from datetime import datetime, timedelta
from collections import Counter
import json

class BPAnalyzer:
    def __init__(self):
        self.categories = {
            'Normal': {'systolic': (0, 119), 'diastolic': (0, 79)},
            'Elevated': {'systolic': (120, 129), 'diastolic': (0, 79)},
            'Hypertension Stage 1': {'systolic': (130, 139), 'diastolic': (80, 89)},
            'Hypertension Stage 2': {'systolic': (140, 179), 'diastolic': (90, 119)},
            'Hypertensive Crisis': {'systolic': (180, 300), 'diastolic': (120, 200)}
        }
    
    def classify_bp(self, systolic, diastolic):
        """Classify blood pressure reading according to AHA guidelines"""
        if systolic > 180 or diastolic > 120:
            return 'Hypertensive Crisis'
        elif systolic >= 140 or diastolic >= 90:
            return 'Hypertension Stage 2'
        elif systolic >= 130 or diastolic >= 80:
            return 'Hypertension Stage 1'
        elif systolic >= 120 and diastolic < 80:
            return 'Elevated'
        else:
            return 'Normal'
    
    def analyze_weekly_readings(self, readings):
        """
        Analyze 7 days of readings and provide health advice
        readings: list of tuples [(systolic, diastolic), ...]
        """
        if len(readings) < 7:
            return {
                'message': 'Need at least 7 readings for weekly analysis',
                'type': 'info',
                'recommendations': ['Continue daily monitoring']
            }
        
        # Classify each reading
        categories = [self.classify_bp(s, d) for s, d in readings[-7:]]
        category_counts = Counter(categories)
        
        # Calculate averages
        avg_systolic = sum(s for s, d in readings[-7:]) / 7
        avg_diastolic = sum(d for s, d in readings[-7:]) / 7
        
        # Determine advice based on readings
        crisis_count = category_counts.get('Hypertensive Crisis', 0)
        stage2_count = category_counts.get('Hypertension Stage 2', 0)
        stage1_count = category_counts.get('Hypertension Stage 1', 0)
        elevated_count = category_counts.get('Elevated', 0)
        
        if crisis_count > 0:
            return {
                'message': '🚨 Immediate medical attention recommended',
                'type': 'danger',
                'recommendations': [
                    'Seek immediate medical care',
                    'Do not delay - this is a medical emergency',
                    'Call your doctor or go to the emergency room'
                ],
                'stats': {
                    'avg_systolic': round(avg_systolic, 1),
                    'avg_diastolic': round(avg_diastolic, 1),
                    'category_counts': dict(category_counts)
                }
            }
        elif stage2_count >= 3:
            return {
                'message': '⚠️ You should consult a doctor',
                'type': 'warning',
                'recommendations': [
                    'Schedule an appointment with your healthcare provider',
                    'Consider lifestyle modifications',
                    'Monitor your blood pressure daily',
                    'Reduce sodium intake and increase physical activity'
                ],
                'stats': {
                    'avg_systolic': round(avg_systolic, 1),
                    'avg_diastolic': round(avg_diastolic, 1),
                    'category_counts': dict(category_counts)
                }
            }
        elif (stage1_count + stage2_count) >= 5:
            return {
                'message': '⚠️ Monitor closely and consider talking to a doctor',
                'type': 'warning',
                'recommendations': [
                    'Continue daily monitoring',
                    'Implement lifestyle changes',
                    'Consider scheduling a check-up',
                    'Focus on diet, exercise, and stress management'
                ],
                'stats': {
                    'avg_systolic': round(avg_systolic, 1),
                    'avg_diastolic': round(avg_diastolic, 1),
                    'category_counts': dict(category_counts)
                }
            }
        else:
            return {
                'message': '✅ No major concerns this week',
                'type': 'success',
                'recommendations': [
                    'Keep up the good work!',
                    'Continue regular monitoring',
                    'Maintain healthy lifestyle habits',
                    'Stay consistent with measurements'
                ],
                'stats': {
                    'avg_systolic': round(avg_systolic, 1),
                    'avg_diastolic': round(avg_diastolic, 1),
                    'category_counts': dict(category_counts)
                }
            }

# Example usage and testing
if __name__ == "__main__":
    analyzer = BPAnalyzer()
    
    # Test data - 7 days of readings
    test_readings = [
        (118, 78),  # Normal
        (125, 82),  # Elevated
        (135, 85),  # Stage 1
        (128, 79),  # Elevated
        (142, 92),  # Stage 2
        (138, 88),  # Stage 1
        (145, 95),  # Stage 2
    ]
    
    print("Blood Pressure Analysis Demo")
    print("=" * 40)
    
    # Classify individual readings
    print("\nIndividual Reading Classifications:")
    for i, (sys, dia) in enumerate(test_readings, 1):
        category = analyzer.classify_bp(sys, dia)
        print(f"Day {i}: {sys}/{dia} mmHg -> {category}")
    
    # Weekly analysis
    print("\nWeekly Analysis:")
    advice = analyzer.analyze_weekly_readings(test_readings)
    print(f"Message: {advice['message']}")
    print(f"Type: {advice['type']}")
    print(f"Average BP: {advice['stats']['avg_systolic']}/{advice['stats']['avg_diastolic']} mmHg")
    
    print("\nRecommendations:")
    for rec in advice['recommendations']:
        print(f"• {rec}")
    
    print("\nCategory Distribution:")
    for category, count in advice['stats']['category_counts'].items():
        print(f"• {category}: {count} reading(s)")
