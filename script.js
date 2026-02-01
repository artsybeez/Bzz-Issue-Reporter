// Logjika lol
        let issues = [
            {
                id: '1',
                title: 'Login button not responding on mobile',
                description: 'When users try to log in from mobile devices, the button sometimes doesn\'t register taps. This seems to happen more frequently on iOS devices.',
                category: 'Bug',
                priority: 'high',
                status: 'in-progress',
                createdAt: new Date(Date.now() - 3600000 * 2),
                comments: [],
            },
            {
                id: '2',
                title: 'Add dark mode support',
                description: 'Users have requested a dark mode option to reduce eye strain during nighttime usage. This would be a great addition to improve user experience.',
                category: 'Feature Request',
                priority: 'medium',
                status: 'open',
                createdAt: new Date(Date.now() - 86400000 * 1),
                comments: [],
            },
            {
                id: '3',
                title: 'Dashboard cards alignment issue',
                description: 'The cards on the dashboard are not aligning properly on tablet screens. They overlap slightly when the viewport is around 768px.',
                category: 'UI Issue',
                priority: 'low',
                status: 'resolved',
                createdAt: new Date(Date.now() - 86400000 * 3),
                fileName: 'screenshot.png',
                comments: [],
            },
        ];

        let currentPriority = 'medium';
        let currentFileName = '';
        let expandedIssueId = null;
        let filterPriority = '';
        let filterCategory = '';
        let filterStatus = '';

        document.addEventListener('DOMContentLoaded', function() {
            // dark mode, yes my eyes hurt from the light mode ver
            const isDarkMode = localStorage.getItem('darkMode') === 'true';
            if (isDarkMode) {
                document.body.classList.add('dark-mode');
                updateDarkModeIcon();
            }
            renderIssues();
        });

        function toggleForm() {
            const formCard = document.getElementById('formCard');
            const toggleText = document.getElementById('toggleText');
            
            if (formCard.classList.contains('hidden')) {
                formCard.classList.remove('hidden');
                toggleText.textContent = 'Hide Form';
            } else {
                formCard.classList.add('hidden');
                toggleText.textContent = 'New Issue';
            }
        }

        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
            updateDarkModeIcon();
        }

        function updateDarkModeIcon() {
            const icon = document.getElementById('darkModeIcon');
            const isDarkMode = document.body.classList.contains('dark-mode');
            icon.textContent = isDarkMode ? '☀️' : '🌙';
        }

        function setPriority(priority) {
            currentPriority = priority;
            
            document.querySelectorAll('.priority-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            event.target.classList.add('active');
        }

        function handleFileChange(event) {
            const file = event.target.files[0];
            const fileLabel = document.getElementById('fileLabel');
            
            if (file) {
                currentFileName = file.name;
                fileLabel.textContent = file.name;
            } else {
                currentFileName = '';
                fileLabel.textContent = 'Upload file';
            }
        }

        function handleSubmit(event) {
            event.preventDefault();
            
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const category = document.getElementById('category').value;
            
            if (!title.trim() || !description.trim()) return;
            
            const newIssue = {
                id: Date.now().toString(),
                title: title,
                description: description,
                category: category,
                priority: currentPriority,
                status: 'open',
                createdAt: new Date(),
                fileName: currentFileName || undefined,
                comments: [],
            };
            
            issues.unshift(newIssue);
            
            document.getElementById('issueForm').reset();
            document.getElementById('fileLabel').textContent = 'Upload file';
            currentFileName = '';
            currentPriority = 'medium';
            
            document.querySelectorAll('.priority-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.classList.contains('medium')) {
                    btn.classList.add('active');
                }
            });
            
            renderIssues();
            
            // Hide the form after submission
            const formCard = document.getElementById('formCard');
            formCard.classList.add('hidden');
            document.getElementById('toggleText').textContent = ' + New Issue';
        }

        function formatDate(date) {
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays === 1) return 'Yesterday';
            return `${diffDays}d ago`;
        }

        function getStatusLabel(status) {
            const labels = {
                'open': '📋 Open',
                'in-progress': '⏳ In Progress',
                'resolved': '✓ Resolved'
            };
            return labels[status] || status;
        }

        function changeStatus(id, newStatus) {
            issues = issues.map(issue => 
                issue.id === id ? { ...issue, status: newStatus } : issue
            );
            renderIssues();
        }

        function toggleIssueExpanded(id) {
            expandedIssueId = expandedIssueId === id ? null : id;
            renderIssues();
        }

        function addComment(issueId) {
            const commentText = document.getElementById(`comment-input-${issueId}`).value.trim();
            
            if (!commentText) return;
            
            const issue = issues.find(i => i.id === issueId);
            if (!issue) return;
            
            issue.comments.push({
                id: Date.now().toString(),
                text: commentText,
                createdAt: new Date(),
                replies: [],
            });
            
            document.getElementById(`comment-input-${issueId}`).value = '';
            renderIssues();
        }

        function deleteComment(issueId, commentId) {
            const issue = issues.find(i => i.id === issueId);
            if (!issue) return;
            
            issue.comments = issue.comments.filter(c => c.id !== commentId);
            renderIssues();
        }

        function addReply(issueId, commentId) {
            const replyText = document.getElementById(`reply-input-${issueId}-${commentId}`).value.trim();
            
            if (!replyText) return;
            
            const issue = issues.find(i => i.id === issueId);
            if (!issue) return;
            
            const comment = issue.comments.find(c => c.id === commentId);
            if (!comment) return;
            
            if (!comment.replies) {
                comment.replies = [];
            }
            
            comment.replies.push({
                id: Date.now().toString(),
                text: replyText,
                createdAt: new Date(),
            });
            
            document.getElementById(`reply-input-${issueId}-${commentId}`).value = '';
            renderIssues();
        }

        function deleteReply(issueId, commentId, replyId) {
            const issue = issues.find(i => i.id === issueId);
            if (!issue) return;
            
            const comment = issue.comments.find(c => c.id === commentId);
            if (!comment || !comment.replies) return;
            
            comment.replies = comment.replies.filter(r => r.id !== replyId);
            renderIssues();
        }

        function toggleReplyForm(issueId, commentId) {
            const form = document.getElementById(`reply-form-${issueId}-${commentId}`);
            if (form) {
                form.style.display = form.style.display === 'none' ? 'flex' : 'none';
            }
        }

        function applyFilters() {
            filterPriority = document.getElementById('filterPriority').value;
            filterCategory = document.getElementById('filterCategory').value;
            filterStatus = document.getElementById('filterStatus').value;
            renderIssues();
        }

        function renderIssues() {
            const issuesList = document.getElementById('issuesList');
            const issueCount = document.getElementById('issueCount');
            
            // Filter issues based on selected filters
            const filteredIssues = issues.filter(issue => {
                const priorityMatch = !filterPriority || issue.priority === filterPriority;
                const categoryMatch = !filterCategory || issue.category === filterCategory;
                const statusMatch = !filterStatus || issue.status === filterStatus;
                return priorityMatch && categoryMatch && statusMatch;
            });
            
            issueCount.textContent = `${filteredIssues.length} ${filteredIssues.length === 1 ? 'issue' : 'issues'}`;
            
            issuesList.innerHTML = '';
            
            if (issues.length === 0) {
                issuesList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <h3>No issues yet</h3>
                        <p>Submit your first issue to get started</p>
                    </div>
                `;
                return;
            }

            if (filteredIssues.length === 0) {
                issuesList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🔍</div>
                        <h3>No matching issues</h3>
                        <p>Try adjusting your filters</p>
                    </div>
                `;
                return;
            }
            
            filteredIssues.forEach(issue => {
                const issueCard = document.createElement('div');
                const isExpanded = expandedIssueId === issue.id;
                issueCard.className = `issue-card ${issue.priority} ${isExpanded ? 'expanded' : ''}`;
                
                let commentsHtml = '';
                if (isExpanded) {
                    commentsHtml = `
                        <div class="comments-section">
                            <div class="comments-header">
                                <h4>Comments <span class="comment-count">${issue.comments.length}</span></h4>
                            </div>
                            
                            <div class="comments-list">
                                ${issue.comments.length === 0 ? '<p class="no-comments">No comments yet. Be the first to comment!</p>' : ''}
                                ${issue.comments.map(comment => `
                                    <div class="comment">
                                        <div class="comment-header">
                                            <span class="comment-time">${formatDate(comment.createdAt)}</span>
                                        </div>
                                        <p class="comment-text">${comment.text}</p>
                                        <button class="btn-reply" onclick="toggleReplyForm('${issue.id}', '${comment.id}')">
                                            💬 Reply
                                        </button>
                                        
                                        ${comment.replies && comment.replies.length > 0 ? `
                                            <div class="replies-section">
                                                ${comment.replies.map(reply => `
                                                    <div class="reply">
                                                        <div class="reply-header">
                                                            <span class="reply-time">${formatDate(reply.createdAt)}</span>
                                                        </div>
                                                        <p class="reply-text">${reply.text}</p>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        ` : ''}
                                        
                                        <div class="reply-form" id="reply-form-${issue.id}-${comment.id}" style="display: none;">
                                            <input 
                                                type="text" 
                                                id="reply-input-${issue.id}-${comment.id}" 
                                                class="reply-input" 
                                                placeholder="Write a reply..."
                                                onkeypress="if(event.key === 'Enter') addReply('${issue.id}', '${comment.id}')"
                                            >
                                            <button class="btn-comment" onclick="addReply('${issue.id}', '${comment.id}')">
                                                <span>↩️</span>
                                                <span>Reply</span>
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <div class="comment-form">
                                <input 
                                    type="text" 
                                    id="comment-input-${issue.id}" 
                                    class="comment-input" 
                                    placeholder="Add a comment to help resolve this issue..."
                                    onkeypress="if(event.key === 'Enter') addComment('${issue.id}')"
                                >
                                <button class="btn-comment" onclick="addComment('${issue.id}')">
                                    <span>💬</span>
                                    <span>Comment</span>
                                </button>
                            </div>
                        </div>
                    `;
                }
                
                issueCard.innerHTML = `
                    <div class="issue-main" style="cursor: default;">
                        <div class="issue-header">
                            <h3 class="issue-title">${issue.title}</h3>
                            <span class="status-badge ${issue.status}">${getStatusLabel(issue.status)}</span>
                        </div>
                        
                        <p class="issue-description">${issue.description}</p>
                        
                        <div class="issue-footer">
                            <div class="issue-meta">
                                <span class="meta-tag">${issue.category}</span>
                                <span class="meta-item">
                                    <span>🕐</span>
                                    <span>${formatDate(issue.createdAt)}</span>
                                </span>
                                ${issue.fileName ? `
                                    <span class="meta-item">
                                        <span>📄</span>
                                        <span>${issue.fileName}</span>
                                    </span>
                                ` : ''}
                            </div>

                            <div class="issue-controls">
                                <select class="status-dropdown" onclick="event.stopPropagation();" onchange="changeStatus('${issue.id}', this.value);">
                                    <option value="open" ${issue.status === 'open' ? 'selected' : ''}>Open</option>
                                    <option value="in-progress" ${issue.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                                    <option value="resolved" ${issue.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                                </select>
                                <span class="meta-item comment-indicator">
                                    <span>💬</span>
                                    <span>${issue.comments.length}</span>
                                    <button class="btn-toggle-comments" onclick="event.stopPropagation(); toggleIssueExpanded('${issue.id}');">
                                        ${isExpanded ? 'Close' : 'Comments'}
                                    </button>
                                </span>
                            </div>
                        </div>
                    </div>
                    ${commentsHtml}
                `;
                
                issuesList.appendChild(issueCard);
            });
        }