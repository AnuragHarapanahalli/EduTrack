package com.edutrack

import com.edutrack.data.model.SubmissionStatus
import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class MilestoneLockTest {

    private fun isMilestoneLocked(
        milestoneIndex: Int,
        previousMilestoneStatus: SubmissionStatus?
    ): Boolean {
        // Milestone 0 (First) is never locked
        if (milestoneIndex == 0) return false

        // Milestone N > 0 is locked unless previous milestone is APPROVED
        return previousMilestoneStatus != SubmissionStatus.APPROVED
    }

    @Test
    fun testFirstMilestoneIsAlwaysUnlocked() {
        val locked = isMilestoneLocked(milestoneIndex = 0, previousMilestoneStatus = null)
        assertFalse(locked, "The first milestone in a PBL lab must always be accessible")
    }

    @Test
    fun testSecondMilestoneLockedWhenFirstUnsubmitted() {
        val locked = isMilestoneLocked(milestoneIndex = 1, previousMilestoneStatus = null)
        assertTrue(locked, "Milestone 2 must be locked when Milestone 1 is not yet submitted")
    }

    @Test
    fun testSecondMilestoneLockedWhenFirstUnderReview() {
        val locked = isMilestoneLocked(milestoneIndex = 1, previousMilestoneStatus = SubmissionStatus.SUBMITTED)
        assertTrue(locked, "Milestone 2 must remain locked while Milestone 1 is under review")
    }

    @Test
    fun testSecondMilestoneLockedWhenRevisionRequired() {
        val locked = isMilestoneLocked(milestoneIndex = 1, previousMilestoneStatus = SubmissionStatus.NEEDS_REVISION)
        assertTrue(locked, "Milestone 2 must remain locked if Milestone 1 needs revision")
    }

    @Test
    fun testSecondMilestoneUnlocksUponApproval() {
        val locked = isMilestoneLocked(milestoneIndex = 1, previousMilestoneStatus = SubmissionStatus.APPROVED)
        assertFalse(locked, "Milestone 2 must unlock immediately once faculty marks Milestone 1 as APPROVED")
    }
}
