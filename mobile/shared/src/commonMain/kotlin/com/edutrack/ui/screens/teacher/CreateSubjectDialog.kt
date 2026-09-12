package com.edutrack.ui.screens.teacher

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.ArrowDropUp
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Class
import androidx.compose.material.icons.filled.Group
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.edutrack.data.model.User
import com.edutrack.ui.components.GlassBorderBrush
import com.edutrack.ui.theme.EduBlueLight
import com.edutrack.ui.theme.EduBluePrimary
import com.edutrack.ui.theme.EduSuccess

@Composable
fun CreateSubjectDialog(
    instructor: User,
    onDismiss: () -> Unit,
    onConfirm: (name: String, code: String, batch: String?, desc: String?) -> Unit
) {
    val assignedBatches = remember(instructor) { instructor.assignedBatches.toList().sorted() }

    var name by remember { mutableStateOf("") }
    var code by remember { mutableStateOf("") }
    var selectedBatch by remember { mutableStateOf(assignedBatches.firstOrNull() ?: "") }
    var customBatch by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var batchDropdownExpanded by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(EduBluePrimary),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Class,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Column {
                    Text(
                        text = "Create New Class",
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = "Setup a classroom for your students",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                }
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Class Name
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Class Name *") },
                    placeholder = { Text("e.g. Database Management Systems") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                // Course Code
                OutlinedTextField(
                    value = code,
                    onValueChange = { code = it.uppercase() },
                    label = { Text("Course Code *") },
                    placeholder = { Text("e.g. CSE20120-DBMS") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                // Batch Selection (Restricted to teacher's allotted batches)
                if (assignedBatches.isNotEmpty()) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Assigned Batch (Allotted to You) *",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
                            )
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(EduSuccess.copy(alpha = 0.15f))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "${assignedBatches.size} available",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = EduSuccess
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        // Clickable Batch Selector Dropdown Box
                        Box(modifier = Modifier.fillMaxWidth()) {
                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .border(
                                        1.dp,
                                        MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                                        RoundedCornerShape(10.dp)
                                    )
                                    .clickable { batchDropdownExpanded = !batchDropdownExpanded }
                                    .padding(horizontal = 14.dp, vertical = 12.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.Group,
                                            contentDescription = null,
                                            tint = EduBluePrimary,
                                            modifier = Modifier.size(18.dp)
                                        )
                                        Text(
                                            text = if (selectedBatch.isNotBlank()) "Batch $selectedBatch" else "Select Allotted Batch",
                                            fontWeight = FontWeight.SemiBold,
                                            color = MaterialTheme.colorScheme.onSurface
                                        )
                                    }
                                    Icon(
                                        imageVector = if (batchDropdownExpanded) Icons.Default.ArrowDropUp else Icons.Default.ArrowDropDown,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                    )
                                }
                            }

                            DropdownMenu(
                                expanded = batchDropdownExpanded,
                                onDismissRequest = { batchDropdownExpanded = false },
                                modifier = Modifier
                                    .background(MaterialTheme.colorScheme.surface)
                                    .border(1.dp, GlassBorderBrush, RoundedCornerShape(12.dp))
                            ) {
                                assignedBatches.forEach { batchOption ->
                                    val isCurrent = selectedBatch == batchOption
                                    DropdownMenuItem(
                                        text = {
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.SpaceBetween
                                            ) {
                                                Text(
                                                    text = "Batch $batchOption",
                                                    fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Normal,
                                                    color = if (isCurrent) EduBluePrimary else MaterialTheme.colorScheme.onSurface
                                                )
                                                if (isCurrent) {
                                                    Icon(
                                                        Icons.Default.Check,
                                                        contentDescription = null,
                                                        tint = EduBluePrimary,
                                                        modifier = Modifier.size(16.dp)
                                                    )
                                                }
                                            }
                                        },
                                        onClick = {
                                            selectedBatch = batchOption
                                            batchDropdownExpanded = false
                                        }
                                    )
                                }
                            }
                        }
                    }
                } else {
                    // Fallback if no specific batches are bound to instructor
                    OutlinedTextField(
                        value = customBatch,
                        onValueChange = { customBatch = it.uppercase() },
                        label = { Text("Batch Code (e.g. A1 - optional)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // Description
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description & Syllabus (Optional)") },
                    minLines = 2,
                    maxLines = 3,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val finalBatch = if (assignedBatches.isNotEmpty()) {
                        selectedBatch.trim().ifBlank { null }
                    } else {
                        customBatch.trim().ifBlank { null }
                    }
                    onConfirm(
                        name.trim(),
                        code.trim().uppercase(),
                        finalBatch,
                        description.trim().ifBlank { null }
                    )
                },
                enabled = name.isNotBlank() && code.isNotBlank() && (assignedBatches.isEmpty() || selectedBatch.isNotBlank()),
                colors = ButtonDefaults.buttonColors(containerColor = EduBluePrimary),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Create Class", fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Cancel", textAlign = TextAlign.Center)
            }
        },
        shape = RoundedCornerShape(20.dp),
        containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f)
    )
}
