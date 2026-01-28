// ============================================
// COMMON SCRIPTS (FOR ALL PAGES)
// ============================================

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (header && window.scrollY > 100) {
        header.classList.add('scrolled');
    } else if (header) {
        header.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuToggle.textContent = nav.classList.contains('active') ? '✕' : '☰';
    });

    // Close menu when clicking a link
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            menuToggle.textContent = '☰';
        });
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const header = document.getElementById('header');
            const headerHeight = header ? header.offsetHeight : 0;
            const targetPosition = target.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for animation triggers (Index page)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.product-card, .service-card, .why-item, .stat-item').forEach(el => {
    observer.observe(el);
});


// ============================================
// CONTACT FORM (conn.html)
// ============================================

// Check if we're on the contact page
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    // Firebase imports (using modules)
    import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js').then(({ initializeApp }) => {
        import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js').then(({ getFirestore, collection, addDoc, serverTimestamp }) => {
            
            // Firebase configuration
            const firebaseConfig = {
                apiKey: "AIzaSyCPqaylz5E3AZhLjCn7qOhkNyUm9irFKjI",
                authDomain: "ime-plastic.firebaseapp.com",
                projectId: "ime-plastic",
                storageBucket: "ime-plastic.firebasestorage.app",
                messagingSenderId: "563605582233",
                appId: "1:563605582233:web:118727ccc4125f3ac2e308",
                measurementId: "G-R12G34E476"
            };

            // Initialize Firebase
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);

            // Form submission handler
            contactForm.addEventListener('submit', async function (e) {
                e.preventDefault();

                // Disable submit button
                const submitBtn = this.querySelector('.submit-btn');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending... ⏳';

                // Get form values
                const firstName = document.getElementById('firstName').value;
                const lastName = document.getElementById('lastName').value;
                const email = document.getElementById('userEmail').value;
                const phone = document.getElementById('userPhone').value;
                const company = document.getElementById('companyName').value;
                const inquiryType = document.getElementById('inquiryType').value;
                const message = document.getElementById('userMessage').value;

                // Create message object
                const messageData = {
                    firstName: firstName,
                    lastName: lastName,
                    fullName: `${firstName} ${lastName}`,
                    email: email,
                    phone: phone,
                    company: company || 'Not provided',
                    inquiryType: inquiryType,
                    message: message,
                    status: 'new',
                    createdAt: serverTimestamp(),
                    timestamp: Date.now()
                };

                try {
                    // Add to Firestore
                    const docRef = await addDoc(collection(db, "contactMessages"), messageData);
                    console.log("Document written with ID: ", docRef.id);

                    // Also save to localStorage as backup
                    let messages = [];
                    const stored = localStorage.getItem('ime_contact_messages');
                    if (stored) {
                        messages = JSON.parse(stored);
                    }
                    messages.unshift({
                        id: docRef.id,
                        ...messageData,
                        date: new Date().toLocaleDateString('en-GB'),
                        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                    });
                    localStorage.setItem('ime_contact_messages', JSON.stringify(messages));

                    // Show success message
                    const successMsg = document.getElementById('successMessage');
                    const errorMsg = document.getElementById('errorMessage');
                    successMsg.classList.add('show');
                    errorMsg.classList.remove('show');

                    // Reset form
                    contactForm.reset();

                    // Hide success message after 5 seconds
                    setTimeout(() => {
                        successMsg.classList.remove('show');
                    }, 5000);

                } catch (error) {
                    console.error("Error adding document: ", error);
                    
                    // Show error message
                    const successMsg = document.getElementById('successMessage');
                    const errorMsg = document.getElementById('errorMessage');
                    errorMsg.classList.add('show');
                    successMsg.classList.remove('show');

                    // Hide error message after 5 seconds
                    setTimeout(() => {
                        errorMsg.classList.remove('show');
                    }, 5000);
                } finally {
                    // Re-enable submit button
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Message 📤';
                }
            });
        });
    });
}


// ============================================
// ADMIN DASHBOARD (admin.html)
// ============================================

// Check if we're on the admin page
const loginContainer = document.getElementById('loginContainer');
const dashboard = document.getElementById('dashboard');

if (loginContainer && dashboard) {
    // Firebase imports for admin
    import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js').then(({ initializeApp }) => {
        Promise.all([
            import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js'),
            import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js')
        ]).then(([
            { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged },
            { getFirestore, collection, query, orderBy, onSnapshot, updateDoc, deleteDoc, doc, writeBatch }
        ]) => {
            
            // Firebase configuration
            const firebaseConfig = {
                apiKey: "AIzaSyCPqaylz5E3AZhLjCn7qOhkNyUm9irFKjI",
                authDomain: "ime-plastic.firebaseapp.com",
                projectId: "ime-plastic",
                storageBucket: "ime-plastic.firebasestorage.app",
                messagingSenderId: "563605582233",
                appId: "1:563605582233:web:118727ccc4125f3ac2e308",
                measurementId: "G-R12G34E476"
            };

            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const db = getFirestore(app);

            let allMessages = [];
            let filteredMessages = [];

            // Auth state observer
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    loginContainer.style.display = 'none';
                    dashboard.classList.add('active');
                    loadMessages();
                } else {
                    loginContainer.style.display = 'flex';
                    dashboard.classList.remove('active');
                }
            });

            // Login
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('loginEmail').value;
                    const password = document.getElementById('loginPassword').value;

                    try {
                        await signInWithEmailAndPassword(auth, email, password);
                        document.getElementById('loginError').classList.remove('show');
                    } catch (error) {
                        document.getElementById('loginError').classList.add('show');
                        console.error('Login error:', error);
                    }
                });
            }

            // Logout
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    signOut(auth);
                });
            }

            // View All Data button
            const viewAllDataBtn = document.getElementById('viewAllDataBtn');
            if (viewAllDataBtn) {
                viewAllDataBtn.addEventListener('click', () => {
                    showAllDataModal();
                });
            }

            // Show All Data Modal
            function showAllDataModal() {
                const modal = document.getElementById('allDataModal');
                const tbody = document.getElementById('allDataTableBody');
                
                tbody.innerHTML = allMessages.map((msg, index) => `
                    <tr>
                        <td class="index-col">${index + 1}</td>
                        <td>${msg.date}</td>
                        <td>${msg.time}</td>
                        <td>${msg.fullName || 'undefined'}</td>
                        <td>${msg.email}</td>
                        <td>${msg.phone}</td>
                        <td>${msg.company || 'N/A'}</td>
                        <td>${msg.inquiryType || 'General'}</td>
                        <td>
                            <span class="table-status-badge table-status-${msg.status}">
                                ${msg.status}
                            </span>
                        </td>
                        <td class="message-col">${msg.message}</td>
                    </tr>
                `).join('');
                
                modal.classList.add('active');
            }

            // Close All Data Modal
            window.closeAllDataModal = () => {
                const modal = document.getElementById('allDataModal');
                modal.classList.remove('active');
            };

            // Export All Data
            window.exportAllData = () => {
                if (allMessages.length === 0) {
                    alert('No messages to export');
                    return;
                }

                const csvContent = [
                    ['#', 'Date', 'Time', 'Name', 'Email', 'Phone', 'Company', 'Inquiry Type', 'Status', 'Message'].join(','),
                    ...allMessages.map((msg, index) => [
                        index + 1,
                        msg.date,
                        msg.time,
                        `"${msg.fullName || 'undefined'}"`,
                        msg.email,
                        msg.phone,
                        `"${msg.company || 'N/A'}"`,
                        msg.inquiryType || 'General',
                        msg.status,
                        `"${msg.message.replace(/"/g, '""')}"`
                    ].join(','))
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `all-contact-messages-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                
                showCopySuccess('Data exported successfully!');
            };

            // Copy All Data to Clipboard
            window.copyAllData = async () => {
                if (allMessages.length === 0) {
                    alert('No messages to copy');
                    return;
                }

                const textContent = allMessages.map((msg, index) => {
                    return `
#${index + 1}
Date: ${msg.date} ${msg.time}
Name: ${msg.fullName || 'undefined'}
Email: ${msg.email}
Phone: ${msg.phone}
Company: ${msg.company || 'N/A'}
Inquiry Type: ${msg.inquiryType || 'General'}
Status: ${msg.status}
Message: ${msg.message}
${'='.repeat(80)}
                    `.trim();
                }).join('\n\n');

                try {
                    await navigator.clipboard.writeText(textContent);
                    showCopySuccess('All data copied to clipboard!');
                } catch (error) {
                    console.error('Failed to copy:', error);
                    alert('Failed to copy data to clipboard');
                }
            };

            // Show copy success notification
            function showCopySuccess(message) {
                const notification = document.createElement('div');
                notification.className = 'copy-success';
                notification.textContent = message;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.remove();
                }, 3000);
            }

            // Load messages from Firestore
            function loadMessages() {
                const q = query(collection(db, "contactMessages"), orderBy("createdAt", "desc"));
                
                onSnapshot(q, (snapshot) => {
                    allMessages = [];
                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        const timestamp = data.createdAt?.toDate() || new Date(data.timestamp);
                        allMessages.push({
                            id: doc.id,
                            ...data,
                            date: timestamp.toLocaleDateString('en-GB'),
                            time: timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                            timestamp: timestamp
                        });
                    });
                    
                    updateStats();
                    filterMessages();
                });
            }

            // Update statistics
            function updateStats() {
                const total = allMessages.length;
                const newCount = allMessages.filter(m => m.status === 'new').length;
                const respondedCount = allMessages.filter(m => m.status === 'read').length;
                
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const todayCount = allMessages.filter(m => {
                    const msgDate = m.timestamp;
                    return msgDate >= today;
                }).length;

                document.getElementById('totalMessages').textContent = total;
                document.getElementById('newMessages').textContent = newCount;
                document.getElementById('respondedMessages').textContent = respondedCount;
                document.getElementById('todayMessages').textContent = todayCount;
            }

            // Filter messages
            function filterMessages() {
                const statusFilter = document.getElementById('statusFilter').value;
                const sortFilter = document.getElementById('sortFilter').value;
                const searchTerm = document.getElementById('searchInput').value.toLowerCase();

                filteredMessages = allMessages.filter(msg => {
                    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
                    const matchesSearch = searchTerm === '' || 
                        (msg.fullName && msg.fullName.toLowerCase().includes(searchTerm)) ||
                        msg.email.toLowerCase().includes(searchTerm) ||
                        msg.message.toLowerCase().includes(searchTerm) ||
                        (msg.company && msg.company.toLowerCase().includes(searchTerm));

                    // Time filter
                    let matchesTime = true;
                    if (sortFilter !== 'newest') {
                        const now = new Date();
                        const msgDate = msg.timestamp;
                        
                        if (sortFilter === 'today') {
                            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                            matchesTime = msgDate >= today;
                        } else if (sortFilter === 'week') {
                            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            matchesTime = msgDate >= weekAgo;
                        } else if (sortFilter === 'month') {
                            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                            matchesTime = msgDate >= monthAgo;
                        }
                    }

                    return matchesStatus && matchesSearch && matchesTime;
                });

                renderMessages();
            }

            // Render messages
            function renderMessages() {
                const tbody = document.getElementById('messagesTableBody');
                const emptyState = document.getElementById('emptyState');
                
                if (filteredMessages.length === 0) {
                    tbody.innerHTML = '';
                    emptyState.style.display = 'block';
                    return;
                }

                emptyState.style.display = 'none';
                tbody.innerHTML = filteredMessages.map(msg => `
                    <tr>
                        <td>
                            <div class="date-time-cell">
                                <span class="date">${msg.date}</span>
                                <span class="time">${msg.time}</span>
                            </div>
                        </td>
                        <td class="name-cell">${msg.fullName || 'undefined'}</td>
                        <td class="email-cell">${msg.email}</td>
                        <td class="phone-cell">${msg.phone}</td>
                        <td class="preview-cell">${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''}</td>
                        <td>
                            <span class="table-status-badge table-status-${msg.status}">
                                ${msg.status === 'new' ? 'Read' : msg.status === 'read' ? 'Read' : 'Responded'}
                            </span>
                        </td>
                        <td>
                            <div class="actions-cell">
                                <button class="action-icon-btn btn-view" onclick="viewMessage('${msg.id}')" title="View Message">
                                    👁
                                </button>
                                <button class="action-icon-btn btn-delete-icon" onclick="deleteMessage('${msg.id}')" title="Delete Message">
                                    🗑
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }

            // View message in modal
            window.viewMessage = async (id) => {
                const msg = allMessages.find(m => m.id === id);
                if (!msg) return;

                const modal = document.getElementById('messageModal');
                const modalBody = document.getElementById('modalBody');

                modalBody.innerHTML = `
                    <div class="modal-info-grid">
                        <div class="modal-info-item">
                            <label>Full Name</label>
                            <div class="value">${msg.fullName || 'undefined'}</div>
                        </div>
                        <div class="modal-info-item">
                            <label>Email Address</label>
                            <div class="value">${msg.email}</div>
                        </div>
                        <div class="modal-info-item">
                            <label>Phone Number</label>
                            <div class="value">${msg.phone}</div>
                        </div>
                        <div class="modal-info-item">
                            <label>Company</label>
                            <div class="value">${msg.company || 'Not provided'}</div>
                        </div>
                        <div class="modal-info-item">
                            <label>Inquiry Type</label>
                            <div class="value">${msg.inquiryType || 'General'}</div>
                        </div>
                        <div class="modal-info-item">
                            <label>Date & Time</label>
                            <div class="value">${msg.date} at ${msg.time}</div>
                        </div>
                    </div>
                    <div class="modal-message">
                        <label>Message</label>
                        <div class="modal-message-content">${msg.message}</div>
                    </div>
                    <div class="modal-actions">
                        ${msg.status === 'new' ? 
                            `<button class="btn btn-primary" onclick="markAsReadAndClose('${msg.id}')">
                                <span>✓</span>
                                <span>Mark as Read</span>
                            </button>` :
                            `<button class="btn btn-secondary" onclick="markAsNew('${msg.id}')">
                                <span>↻</span>
                                <span>Mark as New</span>
                            </button>`
                        }
                        <button class="btn btn-danger" onclick="deleteMessageAndClose('${msg.id}')">
                            <span>🗑</span>
                            <span>Delete Message</span>
                        </button>
                        <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                    </div>
                `;

                modal.classList.add('active');

                // Mark as read automatically when viewing
                if (msg.status === 'new') {
                    try {
                        await updateDoc(doc(db, "contactMessages", id), { status: 'read' });
                    } catch (error) {
                        console.error('Error auto-marking as read:', error);
                    }
                }
            };

            // Close modal
            window.closeModal = () => {
                const modal = document.getElementById('messageModal');
                modal.classList.remove('active');
            };

            // Mark as read and close
            window.markAsReadAndClose = async (id) => {
                await markAsRead(id);
                closeModal();
            };

            // Delete message and close
            window.deleteMessageAndClose = async (id) => {
                if (confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
                    await deleteMessage(id);
                    closeModal();
                }
            };

            // Mark as read
            window.markAsRead = async (id) => {
                try {
                    await updateDoc(doc(db, "contactMessages", id), { status: 'read' });
                } catch (error) {
                    console.error('Error updating message:', error);
                    alert('Failed to update message status');
                }
            };

            // Mark as new
            window.markAsNew = async (id) => {
                try {
                    await updateDoc(doc(db, "contactMessages", id), { status: 'new' });
                } catch (error) {
                    console.error('Error updating message:', error);
                    alert('Failed to update message status');
                }
            };

            // Delete message
            window.deleteMessage = async (id) => {
                if (confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
                    try {
                        await deleteDoc(doc(db, "contactMessages", id));
                    } catch (error) {
                        console.error('Error deleting message:', error);
                        alert('Failed to delete message');
                    }
                }
            };

            // Mark all as read
            const markAllReadBtn = document.getElementById('markAllReadBtn');
            if (markAllReadBtn) {
                markAllReadBtn.addEventListener('click', async () => {
                    const newMessages = allMessages.filter(m => m.status === 'new');
                    if (newMessages.length === 0) {
                        alert('No new messages to mark as read');
                        return;
                    }

                    if (confirm(`Mark ${newMessages.length} message(s) as read?`)) {
                        try {
                            const batch = writeBatch(db);
                            newMessages.forEach(msg => {
                                const docRef = doc(db, "contactMessages", msg.id);
                                batch.update(docRef, { status: 'read' });
                            });
                            await batch.commit();
                        } catch (error) {
                            console.error('Error marking all as read:', error);
                            alert('Failed to mark all messages as read');
                        }
                    }
                });
            }

            // Export data
            const exportBtn = document.getElementById('exportBtn');
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    if (allMessages.length === 0) {
                        alert('No messages to export');
                        return;
                    }

                    const csvContent = [
                        ['Date', 'Time', 'Name', 'Email', 'Phone', 'Company', 'Inquiry Type', 'Status', 'Message'].join(','),
                        ...allMessages.map(msg => [
                            msg.date,
                            msg.time,
                            `"${msg.fullName}"`,
                            msg.email,
                            msg.phone,
                            `"${msg.company || ''}"`,
                            msg.inquiryType,
                            msg.status,
                            `"${msg.message.replace(/"/g, '""')}"`
                        ].join(','))
                    ].join('\n');

                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `contact-messages-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                });
            }

            // Filter event listeners
            const statusFilter = document.getElementById('statusFilter');
            const sortFilter = document.getElementById('sortFilter');
            const searchInput = document.getElementById('searchInput');

            if (statusFilter) {
                statusFilter.addEventListener('change', filterMessages);
            }
            if (sortFilter) {
                sortFilter.addEventListener('change', filterMessages);
            }
            if (searchInput) {
                searchInput.addEventListener('input', filterMessages);
            }
        });
    });
}
