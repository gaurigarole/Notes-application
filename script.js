// Notes App JavaScript

class NotesApp {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.currentCategory = 'all';
        this.currentSort = 'updated';
        this.currentView = 'grid';
        this.searchQuery = '';
        this.editingNote = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateCategoryCounts();
        this.updateFooterStats();
        this.renderNotes();
        this.updateRecentNotes();
    }
    
    bindEvents() {
        // Header events
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.renderNotes();
        });
        
        document.getElementById('mobileSearchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.renderNotes();
        });
        
        document.getElementById('gridViewBtn').addEventListener('click', () => {
            this.setViewMode('grid');
        });
        
        document.getElementById('listViewBtn').addEventListener('click', () => {
            this.setViewMode('list');
        });
        
        document.getElementById('mobileMenuBtn').addEventListener('click', () => {
            this.toggleMobileMenu();
        });
        
        // Sidebar events
        document.getElementById('closeMobileMenuBtn').addEventListener('click', () => {
            this.closeMobileMenu();
        });
        
        document.getElementById('newNoteBtn').addEventListener('click', () => {
            this.openNoteModal();
            this.closeMobileMenu();
        });
        
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setCategory(btn.dataset.category);
                this.closeMobileMenu();
            });
        });
        
        // Sort dropdown
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderNotes();
        });
        
        // FAB and empty state button
        document.getElementById('fabBtn').addEventListener('click', () => {
            this.openNoteModal();
        });
        
        document.getElementById('emptyCreateBtn').addEventListener('click', () => {
            this.openNoteModal();
        });
        
        // Modal events
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.closeNoteModal();
        });
        
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeNoteModal();
        });
        
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveNote();
        });
        
        // Delete modal events
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            this.closeDeleteModal();
        });
        
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.confirmDelete();
        });
        
        // Note content events
        document.getElementById('noteContent').addEventListener('input', () => {
            this.updateWordCount();
        });
        
        // Click outside modal to close
        document.getElementById('noteModal').addEventListener('click', (e) => {
            if (e.target.id === 'noteModal') {
                this.closeNoteModal();
            }
        });
        
        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target.id === 'deleteModal') {
                this.closeDeleteModal();
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const menuBtn = document.getElementById('mobileMenuBtn');
            
            if (sidebar.classList.contains('open') && 
                !sidebar.contains(e.target) && 
                !menuBtn.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }
    
    // Category management
    setCategory(category) {
        this.currentCategory = category;
        
        // Update active state
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        // Update page title
        const titles = {
            all: 'All Notes',
            work: 'Work Notes',
            personal: 'Personal Notes',
            ideas: 'Ideas'
        };
        
        document.getElementById('pageTitle').textContent = titles[category];
        this.renderNotes();
    }
    
    // View mode management
    setViewMode(mode) {
        this.currentView = mode;
        
        // Update button states
        document.getElementById('gridViewBtn').classList.toggle('active', mode === 'grid');
        document.getElementById('listViewBtn').classList.toggle('active', mode === 'list');
        
        // Update notes container
        const container = document.getElementById('notesContainer');
        container.classList.toggle('list-view', mode === 'list');
        
        this.renderNotes();
    }
    
    // Mobile menu management
    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('open');
    }
    
    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('open');
    }
    
    // Note filtering and sorting
    getFilteredNotes() {
        let filtered = [...this.notes];
        
        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(note => note.category === this.currentCategory);
        }
        
        // Filter by search query
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(note => 
                note.title.toLowerCase().includes(query) ||
                note.content.toLowerCase().includes(query)
            );
        }
        
        // Sort notes
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'updated':
                default:
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
            }
        });
        
        return filtered;
    }
    
    // Note rendering
    renderNotes() {
        const container = document.getElementById('notesContainer');
        const emptyState = document.getElementById('emptyState');
        const loadingState = document.getElementById('loadingState');
        
        const filteredNotes = this.getFilteredNotes();
        
        // Update note count
        const count = filteredNotes.length;
        document.getElementById('noteCount').textContent = `${count} ${count === 1 ? 'note' : 'notes'}`;
        
        // Show/hide states
        if (filteredNotes.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            
            // Update empty state message
            if (this.searchQuery || this.currentCategory !== 'all') {
                document.getElementById('emptyTitle').textContent = 'No notes found';
                document.getElementById('emptyMessage').textContent = 'Try adjusting your search or filter criteria.';
            } else {
                document.getElementById('emptyTitle').textContent = 'No notes yet';
                document.getElementById('emptyMessage').textContent = 'Create your first note to get started organizing your thoughts.';
            }
        } else {
            container.style.display = 'grid';
            emptyState.style.display = 'none';
        }
        
        loadingState.style.display = 'none';
        
        // Render note cards
        container.innerHTML = filteredNotes.map(note => this.createNoteCard(note)).join('');
        
        // Bind note card events
        this.bindNoteCardEvents();
    }
    
    createNoteCard(note) {
        const categoryColors = {
            work: 'work',
            personal: 'personal',
            ideas: 'ideas'
        };
        
        const categoryLabels = {
            work: 'Work',
            personal: 'Personal',
            ideas: 'Ideas'
        };
        
        const wordCount = this.getWordCount(note.content);
        const timeAgo = this.formatRelativeTime(note.updatedAt);
        
        const isListView = this.currentView === 'list';
        
        return `
            <div class="note-card ${isListView ? 'list-view' : ''}" data-note-id="${note.id}" data-testid="card-note-${note.id}">
                <div class="note-header">
                    <div>
                        <h3 class="note-title">${this.escapeHtml(note.title || 'Untitled')}</h3>
                        <div class="note-meta">
                            <span class="category-badge ${categoryColors[note.category] || 'personal'}">
                                ${categoryLabels[note.category] || 'Personal'}
                            </span>
                            <span class="note-time">${timeAgo}</span>
                        </div>
                    </div>
                    <div class="note-actions">
                        <button class="note-action-btn edit" data-action="edit" data-testid="button-edit-note-${note.id}">
                            ✏️
                        </button>
                        <button class="note-action-btn delete" data-action="delete" data-testid="button-delete-note-${note.id}">
                            🗑️
                        </button>
                    </div>
                </div>
                
                ${!isListView ? `
                    <p class="note-content">${this.escapeHtml(note.content || 'No content')}</p>
                    <div class="note-footer">
                        <span>${wordCount} words</span>
                        <span>Modified ${timeAgo}</span>
                    </div>
                ` : `
                    <p class="note-content">${this.escapeHtml(note.content || 'No content')}</p>
                    <div class="note-footer">
                        <span>${wordCount} words</span>
                        <span>Modified ${timeAgo}</span>
                    </div>
                `}
            </div>
        `;
    }
    
    bindNoteCardEvents() {
        document.querySelectorAll('.note-card').forEach(card => {
            const noteId = card.dataset.noteId;
            const note = this.notes.find(n => n.id === noteId);
            
            // Click to edit (excluding action buttons)
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.note-action-btn')) {
                    this.editNote(note);
                }
            });
            
            // Action buttons
            card.querySelectorAll('.note-action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = btn.dataset.action;
                    
                    if (action === 'edit') {
                        this.editNote(note);
                    } else if (action === 'delete') {
                        this.deleteNote(note);
                    }
                });
            });
        });
    }
    
    // Note CRUD operations
    openNoteModal(note = null) {
        this.editingNote = note;
        
        const modal = document.getElementById('noteModal');
        const title = document.getElementById('modalTitle');
        const noteTitle = document.getElementById('noteTitle');
        const noteContent = document.getElementById('noteContent');
        const categorySelect = document.getElementById('categorySelect');
        const saveBtn = document.getElementById('saveBtn');
        const createdDate = document.getElementById('createdDate');
        const modifiedDate = document.getElementById('modifiedDate');
        
        if (note) {
            title.textContent = 'Edit Note';
            noteTitle.value = note.title;
            noteContent.value = note.content;
            categorySelect.value = note.category;
            saveBtn.textContent = 'Update Note';
            
            createdDate.textContent = `Created ${new Date(note.createdAt).toLocaleDateString()}`;
            modifiedDate.textContent = `Modified ${new Date(note.updatedAt).toLocaleDateString()}`;
            createdDate.style.display = 'inline';
            modifiedDate.style.display = 'inline';
        } else {
            title.textContent = 'New Note';
            noteTitle.value = '';
            noteContent.value = '';
            categorySelect.value = 'personal';
            saveBtn.textContent = 'Save Note';
            
            createdDate.style.display = 'none';
            modifiedDate.style.display = 'none';
        }
        
        this.updateWordCount();
        modal.style.display = 'flex';
        noteTitle.focus();
    }
    
    closeNoteModal() {
        document.getElementById('noteModal').style.display = 'none';
        this.editingNote = null;
    }
    
    saveNote() {
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();
        const category = document.getElementById('categorySelect').value;
        
        if (!title) {
            alert('Please enter a title for your note.');
            return;
        }
        
        const now = new Date().toISOString();
        
        if (this.editingNote) {
            // Update existing note
            this.editingNote.title = title;
            this.editingNote.content = content;
            this.editingNote.category = category;
            this.editingNote.updatedAt = now;
        } else {
            // Create new note
            const newNote = {
                id: this.generateId(),
                title,
                content,
                category,
                createdAt: now,
                updatedAt: now
            };
            
            this.notes.unshift(newNote);
        }
        
        this.saveToStorage();
        this.updateCategoryCounts();
        this.updateFooterStats();
        this.renderNotes();
        this.updateRecentNotes();
        this.closeNoteModal();
        
        this.showToast(this.editingNote ? 'Note updated successfully!' : 'Note created successfully!');
    }
    
    editNote(note) {
        this.openNoteModal(note);
    }
    
    deleteNote(note) {
        this.noteToDelete = note;
        
        const modal = document.getElementById('deleteModal');
        const noteTitle = document.getElementById('deleteNoteTitle');
        
        noteTitle.textContent = note.title || 'Untitled';
        modal.style.display = 'flex';
    }
    
    closeDeleteModal() {
        document.getElementById('deleteModal').style.display = 'none';
        this.noteToDelete = null;
    }
    
    confirmDelete() {
        if (this.noteToDelete) {
            const index = this.notes.findIndex(note => note.id === this.noteToDelete.id);
            if (index !== -1) {
                this.notes.splice(index, 1);
                this.saveToStorage();
                this.updateCategoryCounts();
                this.updateFooterStats();
                this.renderNotes();
                this.updateRecentNotes();
                this.showToast('Note deleted successfully!');
            }
        }
        
        this.closeDeleteModal();
    }
    
    // Recent notes
    updateRecentNotes() {
        const recentContainer = document.getElementById('recentNotes');
        const recentSection = document.getElementById('recentSection');
        
        const recentNotes = [...this.notes]
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 3);
        
        if (recentNotes.length === 0) {
            recentSection.style.display = 'none';
            return;
        }
        
        recentSection.style.display = 'block';
        
        recentContainer.innerHTML = recentNotes.map(note => `
            <div class="recent-note" data-note-id="${note.id}" data-testid="card-recent-note-${note.id}">
                <h4 class="recent-note-title">${this.escapeHtml(note.title || 'Untitled')}</h4>
                <p class="recent-note-preview">${this.escapeHtml(note.content.substring(0, 50))}...</p>
                <p class="recent-note-time">${this.formatRelativeTime(note.updatedAt)}</p>
            </div>
        `).join('');
        
        // Bind recent note events
        recentContainer.querySelectorAll('.recent-note').forEach(item => {
            item.addEventListener('click', () => {
                const noteId = item.dataset.noteId;
                const note = this.notes.find(n => n.id === noteId);
                if (note) {
                    this.editNote(note);
                    this.closeMobileMenu();
                }
            });
        });
    }
    
    // Category counts
    updateCategoryCounts() {
        const counts = {
            all: this.notes.length,
            work: this.notes.filter(n => n.category === 'work').length,
            personal: this.notes.filter(n => n.category === 'personal').length,
            ideas: this.notes.filter(n => n.category === 'ideas').length
        };
        
        Object.entries(counts).forEach(([category, count]) => {
            const element = document.getElementById(`count${category.charAt(0).toUpperCase() + category.slice(1)}`);
            if (element) {
                element.textContent = count;
            }
        });
    }
    
    updateFooterStats() {
        const totalNotes = this.notes.length;
        const totalWords = this.notes.reduce((total, note) => {
            const wordCount = (note.title + ' ' + note.content).trim().split(/\s+/).length;
            return total + (note.title || note.content ? wordCount : 0);
        }, 0);
        
        const totalNotesElement = document.getElementById('totalNotesCount');
        const totalWordsElement = document.getElementById('totalWordsCount');
        
        if (totalNotesElement) {
            totalNotesElement.textContent = totalNotes.toLocaleString();
        }
        
        if (totalWordsElement) {
            totalWordsElement.textContent = totalWords.toLocaleString();
        }
    }
    
    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    saveToStorage() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }
    
    getWordCount(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
    
    updateWordCount() {
        const content = document.getElementById('noteContent').value;
        const wordCount = this.getWordCount(content);
        const charCount = content.length;
        
        document.getElementById('wordCount').textContent = `${wordCount} words`;
        document.getElementById('charCount').textContent = `${charCount} characters`;
    }
    
    formatRelativeTime(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        if (diffInSeconds < 2419200) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
        
        return date.toLocaleDateString();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showToast(message) {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 24px;
            background: #1a1a1a;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NotesApp();
});