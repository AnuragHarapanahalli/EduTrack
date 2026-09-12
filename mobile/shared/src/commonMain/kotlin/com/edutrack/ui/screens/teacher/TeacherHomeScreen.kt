package com.edutrack.ui.screens.teacher

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Class
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.edutrack.data.model.*
import com.edutrack.ui.components.AppleGlassCard
import com.edutrack.ui.components.ClassSidebarContent
import com.edutrack.ui.components.DocumentPreviewDialog
import com.edutrack.ui.components.EduTrackTopBar
import com.edutrack.ui.components.GlassBorderBrush
import com.edutrack.ui.components.SubmissionStatusBadge
import com.edutrack.ui.components.resolveAssetUrl
import com.edutrack.ui.theme.*
import com.edutrack.ui.viewmodel.TeacherUiState
import com.edutrack.ui.viewmodel.TeacherViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TeacherHomeScreen(
    instructor: User,
    teacherViewModel: TeacherViewModel,
    onLogout: () -> Unit
) {
    val uiState by teacherViewModel.uiState.collectAsState()
    val gradingSubmitting by teacherViewModel.gradingSubmitting.collectAsState()
    val actionMessage by teacherViewModel.actionMessage.collectAsState()

    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val coroutineScope = rememberCoroutineScope()

    var showCreateMilestoneDialog by remember { mutableStateOf(false) }
    var showCreateSubjectDialog by remember { mutableStateOf(false) }
    var activeGradingEntry by remember { mutableStateOf<MilestoneRosterEntry?>(null) }
    var previewDocUrl by remember { mutableStateOf<String?>(null) }
    var previewDocName by remember { mutableStateOf<String?>(null) }
    var showMilestonePickerSheet by remember { mutableStateOf(false) }

    LaunchedEffect(instructor.id) {
        teacherViewModel.loadTeacherDashboard(instructor.id)
    }

    val state = uiState
    val subjects = (state as? TeacherUiState.Success)?.subjects ?: emptyList()
    val selectedSubject = (state as? TeacherUiState.Success)?.selectedSubject

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ClassSidebarContent(
                subjects = subjects,
                selectedSubject = selectedSubject,
                userName = instructor.fullName,
                userRole = instructor.role,
                onSelectSubject = { sub ->
                    teacherViewModel.selectSubject(sub, subjects)
                    coroutineScope.launch { drawerState.close() }
                },
                onCreateClassClick = {
                    coroutineScope.launch { drawerState.close() }
                    showCreateSubjectDialog = true
                },
                onLogoutClick = onLogout
            )
        }
    ) {
        Scaffold(
            topBar = {
                EduTrackTopBar(
                    title = selectedSubject?.name ?: "Faculty Dashboard",
                    userName = instructor.fullName,
                    userRole = instructor.role,
                    onMenuClick = {
                        coroutineScope.launch { drawerState.open() }
                    },
                    onLogoutClick = onLogout
                )
            },
            floatingActionButton = {
                val succ = uiState as? TeacherUiState.Success
                if (succ?.selectedSubject != null) {
                    ExtendedFloatingActionButton(
                        onClick = { showCreateMilestoneDialog = true },
                        containerColor = EduBluePrimary,
                        contentColor = Color.White,
                        icon = { Icon(Icons.Default.Add, contentDescription = null) },
                        text = { Text("Add Milestone", fontWeight = FontWeight.Bold) }
                    )
                }
            }
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
            ) {
                when (state) {
                    is TeacherUiState.Loading -> {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator()
                        }
                    }
                    is TeacherUiState.Error -> {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text(state.message, color = MaterialTheme.colorScheme.error)
                        }
                    }
                    is TeacherUiState.Success -> {
                        if (state.subjects.isEmpty()) {
                            Box(
                                modifier = Modifier.fillMaxSize().padding(24.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(16.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Class,
                                        contentDescription = null,
                                        tint = EduBluePrimary,
                                        modifier = Modifier.size(56.dp)
                                    )
                                    Text(
                                        "No lab classes found.",
                                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                                    )
                                    Button(
                                        onClick = { showCreateSubjectDialog = true },
                                        shape = RoundedCornerShape(12.dp)
                                    ) {
                                        Icon(Icons.Default.Add, contentDescription = null)
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Create Your First Class", fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        } else {
                            // Active Class Header Banner
                            selectedSubject?.let { sub ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 16.dp, vertical = 8.dp)
                                        .clip(RoundedCornerShape(14.dp))
                                        .background(
                                            Brush.linearGradient(
                                                listOf(
                                                    MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.65f),
                                                    MaterialTheme.colorScheme.surface.copy(alpha = 0.75f)
                                                )
                                            )
                                        )
                                        .border(1.dp, GlassBorderBrush, RoundedCornerShape(14.dp))
                                        .clickable { coroutineScope.launch { drawerState.open() } }
                                        .padding(horizontal = 14.dp, vertical = 10.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = sub.name,
                                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                            maxLines = 1,
                                            color = MaterialTheme.colorScheme.onSurface
                                        )
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(6.dp))
                                                    .background(EduSuccess)
                                                    .padding(horizontal = 8.dp, vertical = 3.dp),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Text(
                                                    text = sub.code,
                                                    fontSize = 11.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = Color.White,
                                                    textAlign = TextAlign.Center
                                                )
                                            }

                                            if (!sub.batch.isNullOrBlank()) {
                                                Box(
                                                    modifier = Modifier
                                                        .clip(RoundedCornerShape(6.dp))
                                                        .background(EduSuccess.copy(alpha = 0.15f))
                                                        .border(0.5.dp, EduSuccess.copy(alpha = 0.5f), RoundedCornerShape(6.dp))
                                                        .padding(horizontal = 7.dp, vertical = 3.dp),
                                                    contentAlignment = Alignment.Center
                                                ) {
                                                    Text(
                                                        text = "Batch ${sub.batch}",
                                                        fontSize = 10.sp,
                                                        fontWeight = FontWeight.Bold,
                                                        color = EduSuccess,
                                                        textAlign = TextAlign.Center
                                                    )
                                                }
                                            }

                                            Text(
                                                text = "• Switch class ☰",
                                                fontSize = 11.sp,
                                                color = EduSuccess
                                            )
                                        }
                                    }
                                }
                            }

                            // Milestone Selector & Navigation
                            if (state.milestones.isNotEmpty()) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 16.dp, vertical = 4.dp),
                                    verticalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    // Row 1: Header with "All Milestones ▾" trigger
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "LAB MILESTONES (${state.milestones.size})",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            letterSpacing = 1.sp,
                                            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                                        )

                                        TextButton(
                                            onClick = { showMilestonePickerSheet = true },
                                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                                        ) {
                                            Icon(
                                                Icons.Default.Layers,
                                                contentDescription = null,
                                                modifier = Modifier.size(14.dp),
                                                tint = EduBluePrimary
                                            )
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text(
                                                text = "All Milestones ▾",
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = EduBluePrimary
                                            )
                                        }
                                    }

                                    // Row 2: Horizontal Milestone Capsule Pills
                                    LazyRow(
                                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                                        contentPadding = PaddingValues(vertical = 2.dp)
                                    ) {
                                        itemsIndexed(state.milestones) { index, m ->
                                            val isSelected = m.id == state.selectedMilestone?.id
                                            Surface(
                                                onClick = { teacherViewModel.selectMilestone(m) },
                                                shape = RoundedCornerShape(12.dp),
                                                color = if (isSelected) EduBluePrimary else MaterialTheme.colorScheme.surface.copy(alpha = 0.8f),
                                                border = if (isSelected) null else BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
                                                shadowElevation = if (isSelected) 3.dp else 0.dp
                                            ) {
                                                Row(
                                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                                    verticalAlignment = Alignment.CenterVertically,
                                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                                ) {
                                                    Surface(
                                                        shape = RoundedCornerShape(6.dp),
                                                        color = if (isSelected) Color.White.copy(alpha = 0.25f) else EduBluePrimary.copy(alpha = 0.12f)
                                                    ) {
                                                        Text(
                                                            text = "M${index + 1}",
                                                            fontSize = 10.sp,
                                                            fontWeight = FontWeight.Bold,
                                                            color = if (isSelected) Color.White else EduBluePrimary,
                                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                                        )
                                                    }
                                                    Text(
                                                        text = m.title.take(20) + if (m.title.length > 20) "..." else "",
                                                        fontSize = 12.sp,
                                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                                        color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface
                                                    )
                                                }
                                            }
                                        }
                                    }

                                    // Row 3: Active Milestone Overview Card with Progress Breakdown
                                    state.selectedMilestone?.let { activeM ->
                                        val mIndex = state.milestones.indexOfFirst { it.id == activeM.id }.coerceAtLeast(0)
                                        AppleGlassCard(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clickable { showMilestonePickerSheet = true }
                                        ) {
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.SpaceBetween,
                                                verticalAlignment = Alignment.Top
                                            ) {
                                                Column(modifier = Modifier.weight(1f)) {
                                                    Row(
                                                        verticalAlignment = Alignment.CenterVertically,
                                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                                    ) {
                                                        Surface(
                                                            color = EduBluePrimary.copy(alpha = 0.15f),
                                                            shape = RoundedCornerShape(6.dp)
                                                        ) {
                                                            Text(
                                                                text = "ACTIVE TARGET: M${mIndex + 1}",
                                                                fontSize = 10.sp,
                                                                fontWeight = FontWeight.Bold,
                                                                color = EduBluePrimary,
                                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                                            )
                                                        }
                                                        Text(
                                                            text = "${activeM.basePoints.toInt()} pts • ${activeM.maxMarks.toInt()} marks",
                                                            fontSize = 11.sp,
                                                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                                                            fontWeight = FontWeight.SemiBold
                                                        )
                                                    }
                                                    Spacer(modifier = Modifier.height(4.dp))
                                                    Text(
                                                        text = activeM.title,
                                                        fontSize = 14.sp,
                                                        fontWeight = FontWeight.Bold,
                                                        maxLines = 2
                                                    )
                                                    if (!activeM.description.isNullOrBlank()) {
                                                        Text(
                                                            text = activeM.description,
                                                            fontSize = 11.sp,
                                                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                                                            maxLines = 1
                                                        )
                                                    }
                                                }

                                                Icon(
                                                    Icons.Default.KeyboardArrowDown,
                                                    contentDescription = "Switch",
                                                    tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                                                    modifier = Modifier.size(20.dp).padding(top = 4.dp)
                                                )
                                            }

                                            Spacer(modifier = Modifier.height(10.dp))

                                            // Submissions summary stat chips
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.spacedBy(6.dp),
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                val totalStudents = state.roster.size
                                                val submittedCount = state.roster.count { it.submissionId != null }
                                                val gradedCount = state.roster.count { it.status == SubmissionStatus.APPROVED || it.status == SubmissionStatus.NEEDS_REVISION }
                                                val pendingCount = state.roster.count { it.status == SubmissionStatus.SUBMITTED }

                                                RosterStatPill("Total", "$totalStudents", MaterialTheme.colorScheme.surfaceVariant)
                                                RosterStatPill("Submitted", "$submittedCount", EduBluePrimary.copy(alpha = 0.15f), EduBluePrimary)
                                                RosterStatPill("Graded", "$gradedCount", EduSuccess.copy(alpha = 0.15f), EduSuccess)
                                                if (pendingCount > 0) {
                                                    RosterStatPill("Pending", "$pendingCount", EduWarning.copy(alpha = 0.15f), EduWarning)
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            // Submissions Roster List
                            LazyColumn(
                                modifier = Modifier.fillMaxSize(),
                                contentPadding = PaddingValues(16.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                if (state.isRosterLoading) {
                                    item {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(top = 40.dp),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Column(
                                                horizontalAlignment = Alignment.CenterHorizontally,
                                                verticalArrangement = Arrangement.spacedBy(10.dp)
                                            ) {
                                                CircularProgressIndicator(
                                                    modifier = Modifier.size(28.dp),
                                                    color = EduBluePrimary,
                                                    strokeWidth = 2.5.dp
                                                )
                                                Text(
                                                    text = "Loading roster for ${state.selectedMilestone?.title ?: "milestone"}...",
                                                    fontSize = 12.sp,
                                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                                                )
                                            }
                                        }
                                    }
                                } else if (state.roster.isEmpty()) {
                                    item {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(top = 40.dp),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = "No student submissions recorded for this milestone yet.",
                                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                                                fontSize = 13.sp,
                                                textAlign = TextAlign.Center
                                            )
                                        }
                                    }
                                } else {
                                    items(state.roster) { entry ->
                                        TeacherRosterCard(
                                            entry = entry,
                                            maxMarks = state.selectedMilestone?.maxMarks ?: 100.0,
                                            onEvaluateClick = { activeGradingEntry = entry },
                                            onPreviewFile = { url, name ->
                                                previewDocUrl = url
                                                previewDocName = name
                                            }
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Document Preview Dialog
            if (previewDocUrl != null) {
                DocumentPreviewDialog(
                    fileUrl = previewDocUrl,
                    fileName = previewDocName,
                    onDismissRequest = {
                        previewDocUrl = null
                        previewDocName = null
                    }
                )
            }

            // Create Class Dialog
            if (showCreateSubjectDialog) {
                CreateSubjectDialog(
                    instructor = instructor,
                    onDismiss = { showCreateSubjectDialog = false },
                    onConfirm = { name, code, batch, desc ->
                        teacherViewModel.createSubject(name, code, batch, desc, instructor.id)
                        showCreateSubjectDialog = false
                    }
                )
            }

            // Create Milestone Dialog
            if (showCreateMilestoneDialog) {
                val succ = uiState as? TeacherUiState.Success
                succ?.selectedSubject?.let { sub ->
                    CreateMilestoneDialog(
                        subjectId = sub.id,
                        onDismiss = { showCreateMilestoneDialog = false },
                        onConfirm = { title, desc, deadline, base, max ->
                            teacherViewModel.createMilestone(sub.id, title, desc, deadline, base, max, "[]")
                            showCreateMilestoneDialog = false
                        }
                    )
                }
            }

            // Grade Review Bottom Sheet
            if (activeGradingEntry != null) {
                val maxM = (uiState as? TeacherUiState.Success)?.selectedMilestone?.maxMarks ?: 100.0
                ModalBottomSheet(
                    onDismissRequest = { activeGradingEntry = null }
                ) {
                    TeacherGradeEvaluationSheet(
                        entry = activeGradingEntry!!,
                        maxMarks = maxM,
                        isSubmitting = gradingSubmitting,
                        onDismiss = { activeGradingEntry = null },
                        onPreviewFile = { url, name ->
                            previewDocUrl = url
                            previewDocName = name
                        },
                        onSaveGrade = { status, qualityRating, marks, marksLocked, feedback ->
                            activeGradingEntry?.submissionId?.let { subId ->
                                teacherViewModel.evaluateSubmission(
                                    submissionId = subId,
                                    status = status,
                                    qualityRating = qualityRating,
                                    obtainedMarks = marks,
                                    marksLocked = marksLocked,
                                    feedback = feedback
                                )
                            }
                            activeGradingEntry = null
                        }
                    )
                }
            }

            // Milestone Selector Bottom Sheet (All Milestones Quick Switcher)
            if (showMilestonePickerSheet && (uiState as? TeacherUiState.Success)?.milestones?.isNotEmpty() == true) {
                val succ = uiState as TeacherUiState.Success
                ModalBottomSheet(
                    onDismissRequest = { showMilestonePickerSheet = false },
                    sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 20.dp, vertical = 12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Select Milestone",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                                )
                                Text(
                                    text = "${succ.selectedSubject?.name ?: "Class"} • ${succ.milestones.size} milestones available",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                )
                            }

                            TextButton(
                                onClick = {
                                    showMilestonePickerSheet = false
                                    showCreateMilestoneDialog = true
                                }
                            ) {
                                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("New", fontWeight = FontWeight.Bold)
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        LazyColumn(
                            verticalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp)
                        ) {
                            itemsIndexed(succ.milestones) { idx, m ->
                                val isSelected = m.id == succ.selectedMilestone?.id
                                Surface(
                                    onClick = {
                                        teacherViewModel.selectMilestone(m)
                                        showMilestonePickerSheet = false
                                    },
                                    shape = RoundedCornerShape(14.dp),
                                    color = if (isSelected) EduBluePrimary.copy(alpha = 0.12f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                                    border = BorderStroke(
                                        width = if (isSelected) 1.5.dp else 1.dp,
                                        color = if (isSelected) EduBluePrimary else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
                                    ),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(
                                        modifier = Modifier.padding(14.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                                    ) {
                                        Surface(
                                            shape = RoundedCornerShape(8.dp),
                                            color = if (isSelected) EduBluePrimary else MaterialTheme.colorScheme.surface
                                        ) {
                                            Text(
                                                text = "M${idx + 1}",
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 12.sp,
                                                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface,
                                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                            )
                                        }

                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = m.title,
                                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.SemiBold,
                                                fontSize = 14.sp,
                                                color = if (isSelected) EduBluePrimary else MaterialTheme.colorScheme.onSurface
                                            )
                                            if (!m.description.isNullOrBlank()) {
                                                Text(
                                                    text = m.description,
                                                    fontSize = 11.sp,
                                                    maxLines = 2,
                                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                                )
                                            }
                                            Spacer(modifier = Modifier.height(4.dp))
                                            Text(
                                                text = "Due: ${m.deadline.take(10)} • ${m.basePoints.toInt()} pts (${m.maxMarks.toInt()} marks)",
                                                fontSize = 11.sp,
                                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                                            )
                                        }

                                        if (isSelected) {
                                            Icon(
                                                Icons.Default.CheckCircle,
                                                contentDescription = "Selected",
                                                tint = EduBluePrimary,
                                                modifier = Modifier.size(20.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun TeacherRosterCard(
    entry: MilestoneRosterEntry,
    maxMarks: Double,
    onEvaluateClick: () -> Unit,
    onPreviewFile: (url: String, name: String) -> Unit = { _, _ -> }
) {
    val uriHandler = LocalUriHandler.current

    AppleGlassCard(
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(entry.studentName, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium)
                Text(entry.studentEmail, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
            }
            SubmissionStatusBadge(entry.status)
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Student Deliverables Quick Links
        if (!entry.fileUrl.isNullOrBlank() || !entry.submissionLink.isNullOrBlank()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                entry.fileUrl?.let { file ->
                    val fileName = file.substringAfterLast("/")
                    OutlinedButton(
                        onClick = { onPreviewFile(file, fileName) },
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "File ($fileName)",
                            fontSize = 11.sp,
                            maxLines = 1
                        )
                    }
                }

                entry.submissionLink?.let { link ->
                    val target = if (link.startsWith("http://") || link.startsWith("https://")) link else "https://$link"
                    OutlinedButton(
                        onClick = { uriHandler.openUri(target) },
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.OpenInNew, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Link", fontSize = 11.sp)
                    }
                }
            }
            Spacer(modifier = Modifier.height(6.dp))
        }

        if (!entry.comments.isNullOrBlank()) {
            Text(
                "Student note: \"${entry.comments}\"",
                fontSize = 12.sp,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.85f)
            )
            Spacer(modifier = Modifier.height(6.dp))
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (entry.status == SubmissionStatus.APPROVED) {
                Text(
                    text = "Marks: ${entry.obtainedMarks ?: 0.0}/$maxMarks | Final: ${entry.finalPoints ?: 0.0} pts",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = EduSuccess
                )
            } else {
                Text(
                    text = if (entry.submittedAt != null) "Submitted: ${entry.submittedAt.take(16).replace("T", " ")}" else "Awaiting upload",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
            }

            if (entry.submissionId != null) {
                Button(
                    onClick = onEvaluateClick,
                    colors = ButtonDefaults.buttonColors(containerColor = EduBluePrimary),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Grade Work", fontSize = 12.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                }
            }
        }
    }
}

@Composable
fun TeacherGradeEvaluationSheet(
    entry: MilestoneRosterEntry,
    maxMarks: Double,
    isSubmitting: Boolean,
    onDismiss: () -> Unit,
    onPreviewFile: (url: String, name: String) -> Unit = { _, _ -> },
    onSaveGrade: (status: SubmissionStatus, quality: Int?, marks: Double?, marksLocked: Boolean, feedback: String?) -> Unit
) {
    val uriHandler = LocalUriHandler.current

    var status by remember { mutableStateOf(entry.status ?: SubmissionStatus.APPROVED) }
    var marksStr by remember { mutableStateOf(entry.obtainedMarks?.toString() ?: (maxMarks * 0.9).toString()) }
    var qualityRating by remember { mutableStateOf(entry.qualityRating ?: 5) }
    var feedback by remember { mutableStateOf(entry.instructorFeedback ?: "") }
    var marksLocked by remember { mutableStateOf(entry.marksLocked) }

    Surface(
        modifier = Modifier.fillMaxWidth().padding(20.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Column {
                Text(
                    text = "Grading: ${entry.studentName}",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                )
                Text(
                    text = entry.studentEmail,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
            }

            // Student Work & Deliverables Download/Link Section
            if (!entry.fileUrl.isNullOrBlank() || !entry.submissionLink.isNullOrBlank() || !entry.comments.isNullOrBlank()) {
                AppleGlassCard(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Submitted Work & Deliverables",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = EduBlueLight
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    if (!entry.fileUrl.isNullOrBlank()) {
                        val fullFileUrl = resolveAssetUrl(entry.fileUrl)
                        val fileName = entry.fileUrl.substringAfterLast("/")
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = { onPreviewFile(entry.fileUrl, fileName) },
                                colors = ButtonDefaults.buttonColors(containerColor = EduBluePrimary),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Preview",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    maxLines = 1,
                                    textAlign = TextAlign.Center
                                )
                            }

                            OutlinedButton(
                                onClick = { fullFileUrl?.let { uriHandler.openUri(it) } },
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Download",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 12.sp,
                                    maxLines = 1,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                    }

                    if (!entry.submissionLink.isNullOrBlank()) {
                        val linkUrl = if (entry.submissionLink.startsWith("http://") || entry.submissionLink.startsWith("https://")) {
                            entry.submissionLink
                        } else {
                            "https://${entry.submissionLink}"
                        }
                        OutlinedButton(
                            onClick = { uriHandler.openUri(linkUrl) },
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.OpenInNew, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Open Repository / Link: ${entry.submissionLink}",
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 12.sp,
                                maxLines = 1,
                                textAlign = TextAlign.Center
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                    }

                    if (!entry.comments.isNullOrBlank()) {
                        Text(
                            text = "Student Notes: \"${entry.comments}\"",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.85f)
                        )
                    }
                }
            }

            // Status Picker
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = status == SubmissionStatus.APPROVED,
                    onClick = { status = SubmissionStatus.APPROVED },
                    label = { Text("APPROVE (Unlocks Next)") }
                )
                FilterChip(
                    selected = status == SubmissionStatus.NEEDS_REVISION,
                    onClick = { status = SubmissionStatus.NEEDS_REVISION },
                    label = { Text("REVISION REQ.") }
                )
            }

            if (status == SubmissionStatus.APPROVED) {
                OutlinedTextField(
                    value = marksStr,
                    onValueChange = { marksStr = it },
                    label = { Text("Obtained Marks (out of $maxMarks)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text("Quality Rating:", fontSize = 13.sp, fontWeight = FontWeight.Medium)
                    (1..5).forEach { star ->
                        IconButton(onClick = { qualityRating = star }) {
                            Icon(
                                Icons.Default.Star,
                                contentDescription = null,
                                tint = if (star <= qualityRating) GoldTrophy else Color.Gray
                            )
                        }
                    }
                }
            }

            OutlinedTextField(
                value = feedback,
                onValueChange = { feedback = it },
                label = { Text("Constructive Feedback for Student") },
                minLines = 2,
                modifier = Modifier.fillMaxWidth()
            )

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Checkbox(checked = marksLocked, onCheckedChange = { marksLocked = it })
                Text("Lock & Publish Marks (Updates live leaderboard)", fontSize = 13.sp)
            }

            Button(
                onClick = {
                    val marks = marksStr.toDoubleOrNull() ?: maxMarks
                    onSaveGrade(status, qualityRating, marks, marksLocked, feedback.ifBlank { null })
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                enabled = !isSubmitting,
                shape = RoundedCornerShape(10.dp)
            ) {
                if (isSubmitting) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White)
                } else {
                    Text("Publish Evaluation", fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                }
            }
        }
    }
}

@Composable
private fun RosterStatPill(
    label: String,
    value: String,
    bgColor: Color,
    textColor: Color = MaterialTheme.colorScheme.onSurface
) {
    Surface(
        color = bgColor,
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(text = label, fontSize = 10.sp, color = textColor.copy(alpha = 0.7f))
            Text(text = value, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = textColor)
        }
    }
}

