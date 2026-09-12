package com.edutrack.ui.screens.student

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.UploadFile
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
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
import com.edutrack.ui.screens.common.LeaderboardView
import com.edutrack.ui.theme.*
import com.edutrack.ui.viewmodel.LeaderboardViewModel
import com.edutrack.ui.viewmodel.StudentUiState
import com.edutrack.ui.viewmodel.StudentViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudentHomeScreen(
    student: User,
    studentViewModel: StudentViewModel,
    leaderboardViewModel: LeaderboardViewModel,
    onLogout: () -> Unit
) {
    val uiState by studentViewModel.uiState.collectAsState()
    val uploading by studentViewModel.uploading.collectAsState()
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val coroutineScope = rememberCoroutineScope()

    var selectedTab by remember { mutableStateOf(0) } // 0: Milestones Roadmap, 1: Leaderboard
    var activeMilestoneForUpload by remember { mutableStateOf<MilestoneUI?>(null) }
    var previewDocUrl by remember { mutableStateOf<String?>(null) }
    var previewDocName by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(student.id) {
        studentViewModel.loadStudentDashboard(student.id)
    }

    val state = uiState
    val subjects = (state as? StudentUiState.Success)?.subjects ?: emptyList()
    val selectedSubject = (state as? StudentUiState.Success)?.selectedSubject

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ClassSidebarContent(
                subjects = subjects,
                selectedSubject = selectedSubject,
                userName = student.fullName,
                userRole = student.role,
                onSelectSubject = { sub ->
                    studentViewModel.selectSubject(student.id, sub, subjects)
                    coroutineScope.launch { drawerState.close() }
                },
                onLogoutClick = onLogout
            )
        }
    ) {
        Scaffold(
            topBar = {
                EduTrackTopBar(
                    title = selectedSubject?.name ?: "EduTrack PBL",
                    userName = student.fullName,
                    userRole = student.role,
                    onMenuClick = {
                        coroutineScope.launch { drawerState.open() }
                    },
                    onLogoutClick = onLogout
                )
            }
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
            ) {
                when (state) {
                    is StudentUiState.Loading -> {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator()
                        }
                    }
                    is StudentUiState.Error -> {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text(state.message, color = MaterialTheme.colorScheme.error)
                        }
                    }
                    is StudentUiState.Success -> {
                        if (state.subjects.isEmpty()) {
                            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                Text("No enrolled classes found.")
                            }
                        } else {
                            // Active Class Info Banner with Glass look
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
                                                    .background(EduBluePrimary)
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
                                                color = EduBlueLight
                                            )
                                        }
                                    }
                                }
                            }

                            // Glass Tab Row
                            TabRow(
                                selectedTabIndex = selectedTab,
                                containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.90f),
                                contentColor = EduBluePrimary
                            ) {
                                Tab(
                                    selected = selectedTab == 0,
                                    onClick = { selectedTab = 0 },
                                    text = { Text("Milestones", fontWeight = FontWeight.Bold) }
                                )
                                Tab(
                                    selected = selectedTab == 1,
                                    onClick = {
                                        selectedTab = 1
                                        state.selectedSubject?.let {
                                            leaderboardViewModel.loadLeaderboard(it.id)
                                        }
                                    },
                                    text = { Text("Leaderboard", fontWeight = FontWeight.Bold) }
                                )
                            }

                            // Tab Contents
                            if (selectedTab == 0) {
                                NetflixStyleStudentClasswork(
                                    heroMilestone = state.heroMilestone,
                                    milestones = state.milestones,
                                    onOpenUpload = { activeMilestoneForUpload = it },
                                    onPreviewFile = { url, name ->
                                        previewDocUrl = url
                                        previewDocName = name
                                    }
                                )
                            } else {
                                state.selectedSubject?.let { sub ->
                                    LeaderboardView(
                                        subject = sub,
                                        currentUserId = student.id,
                                        leaderboardViewModel = leaderboardViewModel
                                    )
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

            // Upload Bottom Sheet
            if (activeMilestoneForUpload != null) {
                ModalBottomSheet(
                    onDismissRequest = { activeMilestoneForUpload = null }
                ) {
                    SubmitDeliverableSheet(
                        milestoneUI = activeMilestoneForUpload!!,
                        studentId = student.id,
                        uploading = uploading,
                        onDismiss = { activeMilestoneForUpload = null },
                        onPreviewFile = { url, name ->
                            previewDocUrl = url
                            previewDocName = name
                        },
                        onSubmit = { link, fileBytes, fileName, comments ->
                            studentViewModel.submitDeliverable(
                                milestoneId = activeMilestoneForUpload!!.milestone.id,
                                studentId = student.id,
                                link = link,
                                fileBytes = fileBytes,
                                fileName = fileName,
                                comments = comments
                            )
                            activeMilestoneForUpload = null
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun NetflixStyleStudentClasswork(
    heroMilestone: MilestoneUI?,
    milestones: List<MilestoneUI>,
    onOpenUpload: (MilestoneUI) -> Unit,
    onPreviewFile: (url: String, name: String) -> Unit = { _, _ -> }
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. SPOTLIGHT / HERO CARD (Most relevant card to the student)
        if (heroMilestone != null) {
            item {
                Text(
                    text = "FEATURED SPOTLIGHT",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(6.dp))
                NetflixHeroCard(
                    hero = heroMilestone,
                    onUploadClick = { onOpenUpload(heroMilestone) },
                    onPreviewFile = onPreviewFile
                )
            }
        }

        // 2. HORIZONTAL NETFLIX MILESTONE CAROUSEL
        if (milestones.isNotEmpty()) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "LAB MILESTONES ROADMAP",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "${milestones.count { it.submission?.status == SubmissionStatus.APPROVED }}/${milestones.size} Completed",
                        fontSize = 11.sp,
                        color = EduSuccess,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(milestones) { m ->
                        NetflixMilestoneCard(
                            milestoneUI = m,
                            onUploadClick = { onOpenUpload(m) },
                            onPreviewFile = onPreviewFile
                        )
                    }
                }
            }
        }

        // 3. DETAILED LIST VIEW
        item {
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "ALL MILESTONES",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                letterSpacing = 1.sp
            )
        }

        items(milestones) { item ->
            StudentMilestoneCard(
                milestoneUI = item,
                onUploadClick = { onOpenUpload(item) },
                onPreviewFile = onPreviewFile
            )
        }
    }
}

@Composable
fun NetflixHeroCard(
    hero: MilestoneUI,
    onUploadClick: () -> Unit,
    onPreviewFile: (url: String, name: String) -> Unit = { _, _ -> }
) {
    val m = hero.milestone
    val sub = hero.submission

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(
                Brush.linearGradient(
                    colors = listOf(
                        EduBluePrimary.copy(alpha = 0.90f),
                        Color(0xFF1E1B4B).copy(alpha = 0.95f)
                    )
                )
            )
            .border(1.dp, GlassBorderBrush, RoundedCornerShape(20.dp))
            .padding(20.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(Color.White.copy(alpha = 0.20f))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        "ACTIVE TARGET",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
                SubmissionStatusBadge(sub?.status)
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = m.title,
                style = MaterialTheme.typography.titleLarge.copy(
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
            )

            if (!m.description.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = m.description,
                    style = MaterialTheme.typography.bodySmall.copy(color = Color.White.copy(alpha = 0.85f)),
                    maxLines = 2
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    Icon(Icons.Default.Schedule, contentDescription = null, tint = Color.White.copy(alpha = 0.8f), modifier = Modifier.size(16.dp))
                    Text(
                        text = "Due: ${m.deadline.replace("T", " ")}",
                        fontSize = 11.sp,
                        color = Color.White.copy(alpha = 0.9f)
                    )
                }

                Text(
                    text = "${m.basePoints.toInt()} pts",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = GoldTrophy
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (!sub?.fileUrl.isNullOrBlank()) {
                val fileName = sub.fileUrl.substringAfterLast("/")
                OutlinedButton(
                    onClick = { onPreviewFile(sub.fileUrl, fileName) },
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.6f)),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth().height(40.dp)
                ) {
                    Icon(Icons.Default.Visibility, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Preview Uploaded File ($fileName)", color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 12.sp, maxLines = 1)
                }
                Spacer(modifier = Modifier.height(8.dp))
            }

            Button(
                onClick = onUploadClick,
                colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth().height(42.dp)
            ) {
                Icon(Icons.Default.UploadFile, contentDescription = null, tint = EduBluePrimary, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (sub == null) "Submit Deliverables" else "Update Submission",
                    color = EduBluePrimary,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun NetflixMilestoneCard(
    milestoneUI: MilestoneUI,
    onUploadClick: () -> Unit,
    onPreviewFile: (url: String, name: String) -> Unit = { _, _ -> }
) {
    val m = milestoneUI.milestone
    val sub = milestoneUI.submission

    Box(
        modifier = Modifier
            .width(230.dp)
            .height(200.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(
                Brush.linearGradient(
                    listOf(
                        MaterialTheme.colorScheme.surface.copy(alpha = 0.85f),
                        MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.65f)
                    )
                )
            )
            .border(
                width = 1.dp,
                brush = if (milestoneUI.isLocked) Brush.linearGradient(listOf(Color.Gray.copy(0.3f), Color.Transparent)) else GlassBorderBrush,
                shape = RoundedCornerShape(16.dp)
            )
            .alpha(if (milestoneUI.isLocked) 0.5f else 1.0f)
            .padding(14.dp)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (milestoneUI.isLocked) {
                    Icon(Icons.Default.Lock, contentDescription = "Locked", tint = Color.Gray, modifier = Modifier.size(16.dp))
                } else {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        SubmissionStatusBadge(sub?.status)
                        if (!sub?.fileUrl.isNullOrBlank()) {
                            val fileName = sub.fileUrl.substringAfterLast("/")
                            IconButton(
                                onClick = { onPreviewFile(sub.fileUrl, fileName) },
                                modifier = Modifier.size(22.dp)
                            ) {
                                Icon(Icons.Default.Visibility, contentDescription = "Preview", tint = EduBluePrimary, modifier = Modifier.size(14.dp))
                            }
                        }
                    }
                }

                Text(
                    "${m.basePoints.toInt()} pts",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = EduBluePrimary
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = m.title,
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                maxLines = 2
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "Due: ${m.deadline.take(10)}",
                fontSize = 10.sp,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
            )

            Spacer(modifier = Modifier.weight(1f))

            if (milestoneUI.isLocked) {
                Text(
                    "Locked",
                    fontSize = 11.sp,
                    color = Color.Gray,
                    fontWeight = FontWeight.SemiBold
                )
            } else if (sub?.status == SubmissionStatus.APPROVED) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = EduSuccess, modifier = Modifier.size(16.dp))
                    Text("Approved (+${sub.finalPoints ?: 0.0})", fontSize = 11.sp, color = EduSuccess, fontWeight = FontWeight.Bold)
                }
            } else {
                OutlinedButton(
                    onClick = onUploadClick,
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(if (sub == null) "Submit" else "Resubmit", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun StudentMilestoneCard(
    milestoneUI: MilestoneUI,
    onUploadClick: () -> Unit,
    onPreviewFile: (url: String, name: String) -> Unit = { _, _ -> }
) {
    val m = milestoneUI.milestone
    val sub = milestoneUI.submission

    AppleGlassCard(
        modifier = Modifier
            .fillMaxWidth()
            .alpha(if (milestoneUI.isLocked) 0.55f else 1.0f)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (milestoneUI.isLocked) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(Icons.Default.Lock, contentDescription = "Locked", tint = Color.Gray, modifier = Modifier.size(16.dp))
                    Text("LOCKED", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
                }
            } else {
                SubmissionStatusBadge(sub?.status)
            }

            Text(
                "${m.basePoints} Pts (${m.maxMarks.toInt()} Marks)",
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold)
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = m.title,
            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
        )

        if (!m.description.isNullOrBlank()) {
            Text(
                text = m.description,
                style = MaterialTheme.typography.bodySmall,
                maxLines = 2,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        if (!sub?.fileUrl.isNullOrBlank()) {
            val fileName = sub.fileUrl.substringAfterLast("/")
            OutlinedButton(
                onClick = { onPreviewFile(sub.fileUrl, fileName) },
                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.padding(bottom = 6.dp)
            ) {
                Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Preview File ($fileName)", fontSize = 11.sp, maxLines = 1)
            }
        }

        if (milestoneUI.isLocked) {
            Text(
                text = "🔒 Unlocks once the previous milestone is approved by instructor.",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.error
            )
        } else if (sub?.status == SubmissionStatus.APPROVED) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = EduSuccess, modifier = Modifier.size(16.dp))
                Text(
                    text = "Score: ${sub.finalPoints} pts awarded (${sub.obtainedMarks ?: 0.0}/${m.maxMarks} marks)",
                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold, color = EduSuccess)
                )
            }
        } else {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Deadline: ${m.deadline.replace("T", " ")}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )

                TextButton(onClick = onUploadClick) {
                    Text(if (sub == null) "Submit" else "Resubmit", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
