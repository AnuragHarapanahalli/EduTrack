package com.edutrack.ui.screens.student

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AttachFile
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Link
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.material.icons.filled.Visibility
import com.edutrack.data.model.MilestoneUI

@Composable
fun SubmitDeliverableSheet(
    milestoneUI: MilestoneUI,
    studentId: Long,
    uploading: Boolean,
    onDismiss: () -> Unit,
    onPreviewFile: (url: String, name: String) -> Unit = { _, _ -> },
    onSubmit: (link: String?, fileBytes: ByteArray?, fileName: String?, comments: String?) -> Unit
) {
    var submissionLink by remember { mutableStateOf(milestoneUI.submission?.submissionLink ?: "") }
    var comments by remember { mutableStateOf(milestoneUI.submission?.comments ?: "") }
    var selectedFileName by remember { mutableStateOf<String?>(null) }
    var selectedFileBytes by remember { mutableStateOf<ByteArray?>(null) }

    Surface(
        shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp),
        color = MaterialTheme.colorScheme.surface,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Submit: ${milestoneUI.milestone.title}",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    maxLines = 1,
                    modifier = Modifier.weight(1f)
                )
                IconButton(onClick = onDismiss) {
                    Icon(Icons.Default.Close, contentDescription = "Close")
                }
            }

            Text(
                text = "Deadline: ${milestoneUI.milestone.deadline.replace("T", " ")} | Base: ${milestoneUI.milestone.basePoints} pts",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )

            if (!milestoneUI.submission?.fileUrl.isNullOrBlank()) {
                val existingFile = milestoneUI.submission!!.fileUrl!!
                val existingName = existingFile.substringAfterLast("/")
                Spacer(modifier = Modifier.height(10.dp))
                Surface(
                    color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Uploaded: $existingName",
                            style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                            maxLines = 1,
                            modifier = Modifier.weight(1f)
                        )
                        TextButton(
                            onClick = { onPreviewFile(existingFile, existingName) },
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Preview", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // File Attachment Box (Simulated or native picker)
            OutlinedCard(
                modifier = Modifier.fillMaxWidth(),
                onClick = {
                    // For demo / mobile interaction, select a sample deliverable file
                    selectedFileName = "project_deliverable.pdf"
                    selectedFileBytes = "Sample deliverable PDF content".encodeToByteArray()
                }
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Icon(Icons.Default.AttachFile, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                    Column {
                        Text(
                            text = selectedFileName ?: "Tap to choose file (.pdf, .zip, etc.)",
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold)
                        )
                        if (selectedFileName == null) {
                            Text(
                                text = "Max size: 25MB",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // External Link Input
            OutlinedTextField(
                value = submissionLink,
                onValueChange = { submissionLink = it },
                label = { Text("Repository / Demo Link (GitHub, Figma, etc.)") },
                leadingIcon = { Icon(Icons.Default.Link, contentDescription = null) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Private Comments / Notes
            OutlinedTextField(
                value = comments,
                onValueChange = { comments = it },
                label = { Text("Notes for Instructor") },
                minLines = 3,
                maxLines = 4,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Submit Button
            Button(
                onClick = {
                    onSubmit(
                        submissionLink.ifBlank { null },
                        selectedFileBytes,
                        selectedFileName,
                        comments.ifBlank { null }
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                enabled = !uploading && (submissionLink.isNotBlank() || selectedFileName != null || comments.isNotBlank())
            ) {
                if (uploading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = MaterialTheme.colorScheme.onPrimary,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text("Turn In Deliverable", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
