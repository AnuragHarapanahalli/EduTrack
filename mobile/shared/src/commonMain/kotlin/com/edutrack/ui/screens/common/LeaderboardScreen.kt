package com.edutrack.ui.screens.common

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.edutrack.data.model.LeaderboardEntry
import com.edutrack.data.model.Subject
import com.edutrack.ui.theme.*
import com.edutrack.ui.viewmodel.LeaderboardUiState
import com.edutrack.ui.viewmodel.LeaderboardViewModel

@Composable
fun LeaderboardView(
    subject: Subject,
    currentUserId: Long,
    leaderboardViewModel: LeaderboardViewModel
) {
    val uiState by leaderboardViewModel.uiState.collectAsState()

    LaunchedEffect(subject.id) {
        leaderboardViewModel.loadLeaderboard(subject.id)
    }

    when (val state = uiState) {
        is LeaderboardUiState.Loading -> {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        }
        is LeaderboardUiState.Error -> {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(state.message, color = MaterialTheme.colorScheme.error)
            }
        }
        is LeaderboardUiState.Success -> {
            val entries = state.entries
            if (entries.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No leaderboard entries recorded yet.")
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Podium Header (Top 3)
                    if (entries.isNotEmpty()) {
                        item {
                            PodiumHeader(entries.take(3))
                            Spacer(modifier = Modifier.height(12.dp))
                        }
                    }

                    // Full Rankings
                    itemsIndexed(entries) { index, entry ->
                        val isSelf = entry.studentId == currentUserId
                        LeaderboardRow(entry = entry, isSelf = isSelf)
                    }
                }
            }
        }
    }
}

@Composable
fun PodiumHeader(topThree: List<LeaderboardEntry>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        shape = RoundedCornerShape(14.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.Bottom
        ) {
            // Rank 2 (Silver)
            if (topThree.size > 1) {
                PodiumColumn(entry = topThree[1], medal = "🥈", color = SilverTrophy, height = 75.dp)
            }

            // Rank 1 (Gold)
            if (topThree.isNotEmpty()) {
                PodiumColumn(entry = topThree[0], medal = "🥇", color = GoldTrophy, height = 100.dp)
            }

            // Rank 3 (Bronze)
            if (topThree.size > 2) {
                PodiumColumn(entry = topThree[2], medal = "🥉", color = BronzeTrophy, height = 60.dp)
            }
        }
    }
}

@Composable
fun PodiumColumn(entry: LeaderboardEntry, medal: String, color: Color, height: androidx.compose.ui.unit.Dp) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Text(medal, fontSize = 24.sp)
        Text(
            text = entry.studentName.split(" ").firstOrNull() ?: entry.studentName,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            maxLines = 1
        )
        Text(
            text = "${entry.totalPoints.toInt()} pts",
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = color
        )
        Box(
            modifier = Modifier
                .width(60.dp)
                .height(height)
                .clip(RoundedCornerShape(topStart = 8.dp, topEnd = 8.dp))
                .background(color.copy(alpha = 0.35f)),
            contentAlignment = Alignment.Center
        ) {
            Text("#${entry.rank}", fontWeight = FontWeight.Bold, color = color)
        }
    }
}

@Composable
fun LeaderboardRow(entry: LeaderboardEntry, isSelf: Boolean) {
    OutlinedCard(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.outlinedCardColors(
            containerColor = if (isSelf) EduBluePrimary.copy(alpha = 0.08f) else MaterialTheme.colorScheme.surface
        ),
        border = if (isSelf) CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(EduBluePrimary)) else CardDefaults.outlinedCardBorder()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Rank Badge
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .clip(CircleShape)
                    .background(
                        when (entry.rank) {
                            1 -> GoldTrophy.copy(alpha = 0.2f)
                            2 -> SilverTrophy.copy(alpha = 0.2f)
                            3 -> BronzeTrophy.copy(alpha = 0.2f)
                            else -> MaterialTheme.colorScheme.surfaceVariant
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = when (entry.rank) {
                        1 -> "🥇"
                        2 -> "🥈"
                        3 -> "🥉"
                        else -> "#${entry.rank}"
                    },
                    fontSize = if (entry.rank <= 3) 16.sp else 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            // Name & Completion Stats
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        text = entry.studentName,
                        fontWeight = if (isSelf) FontWeight.Bold else FontWeight.SemiBold,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    if (isSelf) {
                        Text("(You)", fontSize = 11.sp, color = EduBluePrimary, fontWeight = FontWeight.Bold)
                    }
                }
                Spacer(modifier = Modifier.height(2.dp))
                LinearProgressIndicator(
                    progress = { (entry.completionPercentage / 100.0).toFloat() },
                    modifier = Modifier.fillMaxWidth().height(4.dp).clip(RoundedCornerShape(2.dp)),
                    color = EduSuccess,
                    trackColor = Color.Gray.copy(alpha = 0.2f)
                )
                Text(
                    text = "${entry.approvedMilestones}/${entry.totalMilestones} approved (${entry.completionPercentage.toInt()}%)",
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
            }

            // Total Points
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "${entry.totalPoints}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = EduBluePrimary
                )
                Text("points", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
            }
        }
    }
}
