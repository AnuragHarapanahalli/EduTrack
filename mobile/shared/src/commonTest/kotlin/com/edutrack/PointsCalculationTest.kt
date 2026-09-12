package com.edutrack

import kotlin.math.round
import kotlin.test.Test
import kotlin.test.assertEquals

class PointsCalculationTest {

    private fun calculateTimelinessMultiplier(hoursBeforeDeadline: Double): Double {
        return when {
            hoursBeforeDeadline >= 24.0 -> 1.2 // Early bonus (+20%)
            hoursBeforeDeadline >= 0.0 -> 1.0  // On-time
            else -> 0.5                        // Late penalty (-50%)
        }
    }

    private fun computeFinalPoints(
        basePoints: Double,
        timelinessMultiplier: Double,
        obtainedMarks: Double,
        maxMarks: Double
    ): Double {
        val qualityRatio = (obtainedMarks / maxMarks).coerceIn(0.0, 1.0)
        val rawPoints = basePoints * timelinessMultiplier * qualityRatio
        return round(rawPoints * 100.0) / 100.0
    }

    @Test
    fun testEarlySubmissionGetsBonusPoints() {
        val multiplier = calculateTimelinessMultiplier(hoursBeforeDeadline = 48.0)
        assertEquals(1.2, multiplier)

        // 100 base * 1.2 multiplier * (50/50 marks) = 120.0 points
        val points = computeFinalPoints(
            basePoints = 100.0,
            timelinessMultiplier = multiplier,
            obtainedMarks = 50.0,
            maxMarks = 50.0
        )
        assertEquals(120.0, points)
    }

    @Test
    fun testOnTimeSubmissionGetsStandardPoints() {
        val multiplier = calculateTimelinessMultiplier(hoursBeforeDeadline = 5.0)
        assertEquals(1.0, multiplier)

        // 100 base * 1.0 * (40/50 marks = 0.8) = 80.0 points
        val points = computeFinalPoints(
            basePoints = 100.0,
            timelinessMultiplier = multiplier,
            obtainedMarks = 40.0,
            maxMarks = 50.0
        )
        assertEquals(80.0, points)
    }

    @Test
    fun testLateSubmissionPenalizedByHalf() {
        val multiplier = calculateTimelinessMultiplier(hoursBeforeDeadline = -12.0)
        assertEquals(0.5, multiplier)

        // 100 base * 0.5 * (50/50 marks = 1.0) = 50.0 points
        val points = computeFinalPoints(
            basePoints = 100.0,
            timelinessMultiplier = multiplier,
            obtainedMarks = 50.0,
            maxMarks = 50.0
        )
        assertEquals(50.0, points)
    }
}
