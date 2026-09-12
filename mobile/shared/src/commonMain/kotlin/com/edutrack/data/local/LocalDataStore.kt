package com.edutrack.data.local

import com.edutrack.data.model.*
import com.edutrack.database.EduTrackDatabase
import com.edutrack.platform.DatabaseDriverFactory

class LocalDataStore(driverFactory: DatabaseDriverFactory) {
    private val database = EduTrackDatabase(driverFactory.createDriver())
    private val queries = database.eduTrackDatabaseQueries

    // ---------------- User Cache ----------------
    fun saveCurrentUser(user: User, token: String) {
        queries.clearUser()
        queries.insertOrUpdateUser(
            id = user.id,
            email = user.email,
            fullName = user.fullName,
            role = user.role.name,
            panel = user.panel,
            batch = user.batch,
            jwtToken = token
        )
    }

    fun getCachedUser(): User? {
        val row = queries.getCurrentUser().executeAsOneOrNull() ?: return null
        return User(
            id = row.id,
            email = row.email,
            fullName = row.fullName,
            role = Role.valueOf(row.role),
            panel = row.panel,
            batch = row.batch
        )
    }

    fun clearUser() {
        queries.clearUser()
    }

    // ---------------- Subjects Cache ----------------
    fun saveSubjects(subjects: List<Subject>) {
        queries.clearSubjects()
        subjects.forEach { s ->
            queries.insertOrUpdateSubject(
                id = s.id,
                name = s.name,
                code = s.code,
                instructorName = s.instructorName,
                instructorId = s.instructorId,
                batch = s.batch,
                description = s.description,
                totalMilestones = s.totalMilestones.toLong(),
                enrolledStudentsCount = s.enrolledStudentsCount.toLong()
            )
        }
    }

    fun getCachedSubjects(): List<Subject> {
        return queries.selectAllSubjects().executeAsList().map { row ->
            Subject(
                id = row.id,
                name = row.name,
                code = row.code,
                instructorName = row.instructorName,
                instructorId = row.instructorId,
                batch = row.batch,
                description = row.description,
                totalMilestones = row.totalMilestones.toInt(),
                enrolledStudentsCount = row.enrolledStudentsCount.toInt()
            )
        }
    }

    // ---------------- Milestones Cache ----------------
    fun saveMilestones(subjectId: Long, milestones: List<Milestone>) {
        queries.clearMilestonesForSubject(subjectId)
        milestones.forEach { m ->
            queries.insertOrUpdateMilestone(
                id = m.id,
                subjectId = subjectId,
                title = m.title,
                description = m.description,
                deadline = m.deadline,
                basePoints = m.basePoints,
                maxMarks = m.maxMarks,
                requiredDeliverables = m.requiredDeliverables,
                isMandatory = if (m.isMandatory) 1L else 0L
            )
        }
    }

    fun getCachedMilestones(subjectId: Long): List<Milestone> {
        return queries.selectMilestonesForSubject(subjectId).executeAsList().map { row ->
            Milestone(
                id = row.id,
                subjectId = row.subjectId,
                title = row.title,
                description = row.description,
                deadline = row.deadline,
                basePoints = row.basePoints,
                maxMarks = row.maxMarks,
                requiredDeliverables = row.requiredDeliverables,
                isMandatory = row.isMandatory == 1L
            )
        }
    }

    // ---------------- Leaderboard Cache ----------------
    fun saveLeaderboard(subjectId: Long, entries: List<LeaderboardEntry>) {
        queries.clearLeaderboardForSubject(subjectId)
        entries.forEach { e ->
            queries.insertOrUpdateLeaderboardEntry(
                subjectId = subjectId,
                rank = e.rank.toLong(),
                studentId = e.studentId,
                studentName = e.studentName,
                studentEmail = e.studentEmail,
                totalPoints = e.totalPoints,
                approvedMilestones = e.approvedMilestones.toLong(),
                totalMilestones = e.totalMilestones.toLong(),
                completionPercentage = e.completionPercentage
            )
        }
    }

    fun getCachedLeaderboard(subjectId: Long): List<LeaderboardEntry> {
        return queries.selectLeaderboardForSubject(subjectId).executeAsList().map { row ->
            LeaderboardEntry(
                rank = row.rank.toInt(),
                studentId = row.studentId,
                studentName = row.studentName,
                studentEmail = row.studentEmail,
                totalPoints = row.totalPoints,
                approvedMilestones = row.approvedMilestones.toInt(),
                totalMilestones = row.totalMilestones.toInt(),
                completionPercentage = row.completionPercentage
            )
        }
    }
}
