let issues = [];
let selectedPriority = 'medium';
let currentFilter = { priority: '', category: '', status: '' };
let expandedIssueId = null;
let currentFileName = '';
let currentFileData = '';

const STORAGE_KEY = 'bzz_issues';

// initialize site
document.addEventListener('DOMContentLoaded', function() {
    // restore dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedDarkMode === 'true' || (savedDarkMode === null && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
    }

    // load issues from localStorage
    loadIssues();
    
    // Initialize Lucide icons
    lucide.createIcons();
});

// Dark Mode Toggle
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
    lucide.createIcons();
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (localStorage.getItem('darkMode') === null) {
        document.documentElement.classList.toggle('dark', e.matches);
        lucide.createIcons();
    }
});

// Toggle Form Visibility
function toggleForm() {
    const formCard = document.getElementById('formCard');
    const isHidden = formCard.classList.contains('hidden');
    
    if (isHidden) {
        formCard.classList.remove('hidden');
        formCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        document.getElementById('toggleText').textContent = 'Cancel';
    } else {
        formCard.classList.add('hidden');
        document.getElementById('toggleText').textContent = 'New Issue';
        document.getElementById('issueForm').reset();
        resetPrioritySelector();
        document.getElementById('fileLabel').textContent = 'Upload file';
        currentFileName = '';
        currentFileData = '';
    }
    
    setTimeout(() => lucide.createIcons(), 100);
}

// Set Priority
function setPriority(priority) {
    selectedPriority = priority;
    document.querySelectorAll('.priority-selector button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Reset Priority Selector to Medium
function resetPrioritySelector() {
    selectedPriority = 'medium';
    document.querySelectorAll('.priority-selector button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains('priority-medium')) {
            btn.classList.add('active');
        }
    });
}

// Handle File Change
function handleFileChange(event) {
    const file = event.target.files[0];
    const label = document.getElementById('fileLabel');
    
    if (file) {
        currentFileName = file.name;
        label.textContent = file.name;
        const reader = new FileReader();
        reader.onload = function(e) {
            currentFileData = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        currentFileName = '';
        currentFileData = '';
        label.textContent = 'Upload file';
    }
}

// Handle Form Submission
function handleSubmit(event) {
    event.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    
    if (!title.trim() || !description.trim()) return;
    
    const issue = {
        id: Date.now().toString(),
        title: title,
        description: description,
        category: category,
        priority: selectedPriority,
        status: 'open',
        fileName: currentFileName || null,
        fileData: currentFileData || null,
        createdAt: new Date().toISOString(),
        comments: []
    };
    
    issues.unshift(issue);
    saveIssues();
    renderIssues();
    toggleForm();
    
    console.log('Issue created:', issue);
}

// Load Issues from localStorage
function loadIssues() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            issues = JSON.parse(saved);
            issues = issues.map(issue => ({
                ...issue,
                id: issue.id.toString(),
                comments: (issue.comments || []).map(comment => ({
                    ...comment,
                    id: comment.id.toString(),
                    replies: (comment.replies || []).map(reply => ({
                        ...reply,
                        id: reply.id.toString()
                    }))
                }))
            }));
        }
    } catch (e) {
        console.error('Failed to load issues from localStorage:', e);
    }
    renderIssues();
}

// Save Issues to localStorage mmm yummy cookies
function saveIssues() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            console.warn('Storage full, saving issues without file data');
            const issuesToSave = issues.map(issue => {
                const { fileData, ...rest } = issue;
                return rest;
            });
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(issuesToSave));
            } catch (e2) {
                console.error('Failed to save even without files:', e2);
            }
        } else {
            console.error('Failed to save issues to localStorage:', e);
        }
    }
}

// Apply Filters
function applyFilters() {
    currentFilter.priority = document.getElementById('filterPriority').value;
    currentFilter.category = document.getElementById('filterCategory').value;
    currentFilter.status = document.getElementById('filterStatus').value;
    renderIssues();
}

// Render Issues
function renderIssues() {
    const issuesList = document.getElementById('issuesList');
    const issueCount = document.getElementById('issueCount');
    const emptyState = document.getElementById('emptyState');
    
    // Filter issues
    let filteredIssues = issues.filter(issue => {
        if (currentFilter.priority && issue.priority !== currentFilter.priority) return false;
        if (currentFilter.category && issue.category !== currentFilter.category) return false;
        if (currentFilter.status && issue.status !== currentFilter.status) return false;
        return true;
    });
    
    issueCount.textContent = `${filteredIssues.length} issue${filteredIssues.length !== 1 ? 's' : ''}`;
    
    if (filteredIssues.length === 0) {
        issuesList.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        issuesList.innerHTML = filteredIssues.map(issue => createIssueCard(issue)).join('');
    }
    
    lucide.createIcons();
}

// Create Issue Card HTML
function createIssueCard(issue) {
    const date = new Date(issue.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    const isExpanded = expandedIssueId === issue.id;
    const comments = issue.comments || [];
    
    let commentsHtml = '';
    if (isExpanded) {
        commentsHtml = `
            <div class="comments-section">
                <div class="mb-4">
                    <h4 class="text-sm font-semibold flex items-center gap-2">
                        Comments 
                        <span class="comment-count">${comments.length}</span>
                    </h4>
                </div>
                
                <div class="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    ${comments.length === 0 ? '<p class="no-comments">No comments yet. Be the first to comment!</p>' : ''}
                    ${comments.map(comment => createCommentHtml(issue.id, comment)).join('')}
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
                        <i data-lucide="message-circle" class="w-4 h-4"></i>
                        <span>Comment</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="glass-card rounded-2xl p-6 issue-card priority-${issue.priority} ${isExpanded ? 'expanded' : ''}">
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2 flex-wrap">
                        <span class="status-${issue.status} px-3 py-1 rounded-lg text-xs font-medium">
                            ${issue.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span class="text-xs text-gray-500 dark:text-gray-500">${issue.category}</span>
                    </div>
                    <h4 class="text-lg font-semibold mb-2">${escapeHtml(issue.title)}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${escapeHtml(issue.description)}</p>
                    <div class="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <div class="flex items-center gap-1">
                            <i data-lucide="calendar" class="w-3 h-3"></i>
                            <span>${date}</span>
                        </div>
                        ${issue.fileName ? `
                        <div class="flex items-center gap-1 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onclick="viewFilePreview('${issue.id}', '${escapeHtml(issue.fileName)}')">
                            <i data-lucide="paperclip" class="w-3 h-3"></i>
                            <span>${escapeHtml(issue.fileName)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="flex gap-2 flex-wrap">
                    <select class="status-dropdown" onchange="changeStatus('${issue.id}', this.value)">
                        <option value="open" ${issue.status === 'open' ? 'selected' : ''}>Open</option>
                        <option value="in-progress" ${issue.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="resolved" ${issue.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                    <button onclick="toggleIssueExpanded('${issue.id}')" class="btn-toggle-comments">
                        <i data-lucide="message-circle" class="w-3 h-3 inline"></i>
                        ${comments.length} ${isExpanded ? 'Close' : 'Comments'}
                    </button>
                    <button onclick="deleteIssue('${issue.id}')" class="btn-delete-issue">
                        <i data-lucide="trash-2" class="w-3 h-3"></i>
                        Delete
                    </button>
                </div>
            </div>
            ${commentsHtml}
        </div>
    `;
}

// Create Comment HTML
function createCommentHtml(issueId, comment) {
    const replies = comment.replies || [];
    
    return `
        <div class="comment">
            <div class="comment-header">
                <span class="comment-time">${formatDate(comment.createdAt)}</span>
                <button class="btn-delete-comment" onclick="deleteComment('${issueId}', '${comment.id}')">
                    <i data-lucide="x" class="w-3 h-3"></i>
                </button>
            </div>
            <p class="comment-text">${escapeHtml(comment.text)}</p>
            <button class="btn-reply" onclick="toggleReplyForm('${issueId}', '${comment.id}')">
                <i data-lucide="corner-down-right" class="w-3 h-3 inline"></i>
                Reply
            </button>
            
            ${replies.length > 0 ? `
                <div class="replies-section">
                    ${replies.map(reply => `
                        <div class="reply">
                            <div class="reply-header">
                                <span class="reply-time">${formatDate(reply.createdAt)}</span>
                                <button class="btn-delete-comment" onclick="deleteReply('${issueId}', '${comment.id}', '${reply.id}')">
                                    <i data-lucide="x" class="w-3 h-3"></i>
                                </button>
                            </div>
                            <p class="reply-text">${escapeHtml(reply.text)}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="reply-form" id="reply-form-${issueId}-${comment.id}" style="display: none;">
                <input 
                    type="text" 
                    id="reply-input-${issueId}-${comment.id}" 
                    class="reply-input" 
                    placeholder="Write a reply..."
                    onkeypress="if(event.key === 'Enter') addReply('${issueId}', '${comment.id}')"
                >
                <button class="btn-comment" onclick="addReply('${issueId}', '${comment.id}')">
                    <i data-lucide="send" class="w-4 h-4"></i>
                    <span>Reply</span>
                </button>
            </div>
        </div>
    `;
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Change Issue Status
function changeStatus(id, newStatus) {
    issues = issues.map(issue => 
        issue.id === id ? { ...issue, status: newStatus } : issue
    );
    saveIssues();
    renderIssues();
}

// Delete Issue
function deleteIssue(id) {
    if (confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
        issues = issues.filter(issue => issue.id !== id);
        if (expandedIssueId === id) {
            expandedIssueId = null;
        }
        saveIssues();
        renderIssues();
    }
}

// Toggle Issue Expanded State
function toggleIssueExpanded(id) {
    expandedIssueId = expandedIssueId === id ? null : id;
    renderIssues();
}

// View File Preview
function viewFilePreview(issueId, fileName) {
    const issue = issues.find(i => i.id === issueId);
    if (!issue || !issue.fileData) return;
    
    const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName);
    const isPdf = /\.pdf$/i.test(fileName);
    
    const modal = document.createElement('div');
    modal.className = 'file-modal';
    
    let content = '';
    if (isImage) {
        content = `<img src="${issue.fileData}" alt="${fileName}" class="file-modal-image">`;
    } else if (isPdf) {
        content = `<iframe src="${issue.fileData}" class="file-modal-pdf"></iframe>`;
    } else {
        content = `<div class="file-not-viewable">📁 Cannot preview this file type</div>`;
    }
    
    modal.innerHTML = `
        <div class="file-modal-content">
            <div class="file-modal-header">
                <h3>${escapeHtml(fileName)}</h3>
                <button class="file-modal-close" onclick="this.closest('.file-modal').remove();">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="file-modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    lucide.createIcons();
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.remove();
    });
}

// Add Comment
function addComment(issueId) {
    const input = document.getElementById(`comment-input-${issueId}`);
    const commentText = input.value.trim();
    
    if (!commentText) return;
    
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;
    
    if (!issue.comments) {
        issue.comments = [];
    }
    
    issue.comments.push({
        id: Date.now().toString(),
        text: commentText,
        createdAt: new Date().toISOString(),
        replies: []
    });
    
    saveIssues();
    renderIssues();
}

// Delete Comment
function deleteComment(issueId, commentId) {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;
    
    issue.comments = issue.comments.filter(c => c.id !== commentId);
    saveIssues();
    renderIssues();
}

// Toggle Reply Form
function toggleReplyForm(issueId, commentId) {
    const form = document.getElementById(`reply-form-${issueId}-${commentId}`);
    if (form) {
        const isHidden = form.style.display === 'none';
        form.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) {
            const input = document.getElementById(`reply-input-${issueId}-${commentId}`);
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    }
}

// Add Reply
function addReply(issueId, commentId) {
    const input = document.getElementById(`reply-input-${issueId}-${commentId}`);
    const replyText = input.value.trim();
    
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
        createdAt: new Date().toISOString()
    });
    
    saveIssues();
    renderIssues();
}

// Delete Reply
function deleteReply(issueId, commentId, replyId) {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;
    
    const comment = issue.comments.find(c => c.id === commentId);
    if (!comment || !comment.replies) return;
    
    comment.replies = comment.replies.filter(r => r.id !== replyId);
    saveIssues();
    renderIssues();
}
