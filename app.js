const defaultDocuments = [
  {
    title: 'Financial Aid Contact Information',
    labels: ['Financial Aid', 'First Stop'],
    type: 'FAQ / Office Info',
    status: 'Published',
    notes: 'TBD.'
  },
  {
    title: 'Admissions Application Steps',
    labels: ['Admission', 'First Stop'],
    type: 'Step-by-step Guide',
    status: 'Published',
    notes: 'TBD.'
  },
  {
    title: 'Counseling Appointment Instructions',
    labels: ['Counseling', 'First Stop'],
    type: 'FAQ / Guide',
    status: 'Needs Review',
    notes: 'TBD.'
  }
];

const defaultTickets = [
  {
    id: '0005',
    student: 'Jane D.',
    email: 'jane.student@example.edu',
    department: 'Financial Aid',
    issue: 'Student says their financial aid disappeared.',
    status: 'Open',
    priority: 'High',
    summary: 'Student is asking about a possible account-specific financial aid issue. Staff should review the official student record system before replying.',
    transcript: 'Student: Why did my financial aid disappear?\nBot: This may involve private student records. I can create a ticket for Financial Aid staff instead of guessing.'
  },
  {
    id: '0004',
    student: 'Mike L.',
    email: 'mike.student@example.edu',
    department: 'Admission',
    issue: 'Student needs help with application steps.',
    status: 'Pending',
    priority: 'Medium',
    summary: 'Student is confused about next steps after submitting an application.',
    transcript: 'Student: I applied but I do not know what to do next.\nBot: I can create a ticket for Admissions staff.'
  },
  {
    id: '0003',
    student: 'Sara K.',
    email: 'sara.student@example.edu',
    department: 'Counseling',
    issue: 'Student needs help making a counseling appointment.',
    status: 'Open',
    priority: 'Low',
    summary: 'Student is asking for appointment help and may need a link or direct staff response.',
    transcript: 'Student: How do I meet with a counselor?\nBot: Here are general instructions. Would you like staff help?'
  }
];

const defaultArchive = [
  {
    id: '0002',
    student: 'Alex R.',
    department: 'First Stop',
    issue: 'Asked where to find student ID number.',
    resolvedBy: 'First Stop Staff',
    resolvedDate: '2026-05-10',
    resolution: 'Sent student general instructions and referred them to official student portal.'
  },
  {
    id: '0001',
    student: 'Nina P.',
    department: 'Admission',
    issue: 'Asked about application deadline.',
    resolvedBy: 'Admissions Staff',
    resolvedDate: '2026-05-11',
    resolution: 'Provided public application deadline information.'
  }
];

function getData(key, defaults) {
  const saved = localStorage.getItem(key);
  if (!saved) {
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  }
  try {
    return JSON.parse(saved);
  } catch {
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getSelectedLabels() {
  return Array.from(document.querySelectorAll('input[name="label"]:checked')).map((box) => box.value);
}

function labelsToHtml(labels) {
  return labels.map((label) => `<span class="tag">${label}</span>`).join(' ');
}

function renderContentTable() {
  const table = document.getElementById('contentTable');
  if (!table) return;

  const documents = getData('documents', defaultDocuments);
  const filter = document.getElementById('contentFilter')?.value || 'All';

  const filtered = filter === 'All'
    ? documents
    : documents.filter((doc) => doc.labels.includes(filter));

  table.innerHTML = filtered.map((doc, index) => `
    <tr>
      <td>${doc.title}</td>
      <td>${labelsToHtml(doc.labels)}</td>
      <td>${doc.type}</td>
      <td>${doc.status}</td>
      <td>${doc.notes}</td>
      <td class="row-actions"><button onclick="deleteDocument(${index})">Delete</button></td>
    </tr>
  `).join('');
}

function addDocument(event) {
  event.preventDefault();
  const title = document.getElementById('docTitle').value.trim();
  const type = document.getElementById('docType').value;
  const status = document.getElementById('docStatus').value;
  const notes = document.getElementById('docNotes').value.trim();
  const labels = getSelectedLabels();

  if (!title || labels.length === 0) {
    alert('Please enter a title and select at least one label.');
    return;
  }

  const documents = getData('documents', defaultDocuments);
  documents.push({ title, labels, type, status, notes });
  saveData('documents', documents);

  event.target.reset();
  renderContentTable();
}

function deleteDocument(index) {
  const documents = getData('documents', defaultDocuments);
  documents.splice(index, 1);
  saveData('documents', documents);
  renderContentTable();
}

function renderTickets() {
  const table = document.getElementById('ticketsTable');
  if (!table) return;

  const tickets = getData('tickets', defaultTickets);
  const departmentFilter = document.getElementById('ticketDepartmentFilter')?.value || 'All';
  const statusFilter = document.getElementById('ticketStatusFilter')?.value || 'All';

  const filtered = tickets.filter((ticket) => {
    const deptOk = departmentFilter === 'All' || ticket.department === departmentFilter;
    const statusOk = statusFilter === 'All' || ticket.status === statusFilter;
    return deptOk && statusOk;
  });

  table.innerHTML = filtered.map((ticket) => `
    <tr>
      <td>#${ticket.id}</td>
      <td>${ticket.student}<br><span class="small-text">${ticket.email}</span></td>
      <td>${ticket.department}</td>
      <td>${ticket.issue}</td>
      <td>${ticket.priority}</td>
      <td class="${ticket.status === 'Open' ? 'status-open' : 'status-pending'}">${ticket.status}</td>
      <td class="row-actions">
        <button onclick="viewTicket('${ticket.id}')">View</button>
        <button onclick="markPending('${ticket.id}')">Mark Pending</button>
        <button class="primary" onclick="resolveTicket('${ticket.id}')">Resolve</button>
      </td>
    </tr>
  `).join('');
}

function viewTicket(id) {
  const tickets = getData('tickets', defaultTickets);
  const ticket = tickets.find((item) => item.id === id);
  if (!ticket) return;

  const detail = document.getElementById('ticketDetail');
  detail.innerHTML = `
    <h3>Ticket #${ticket.id}</h3>
    <p><strong>Student:</strong> ${ticket.student} (${ticket.email})</p>
    <p><strong>Department:</strong> ${ticket.department}</p>
    <p><strong>Issue:</strong> ${ticket.issue}</p>
    <p><strong>AI Summary:</strong> ${ticket.summary}</p>
    <p><strong>Conversation Transcript:</strong></p>
    <pre>${ticket.transcript}</pre>
    <label>Staff Response</label>
    <textarea placeholder="Write a staff response here..."></textarea>
    <button>Save Response Draft</button>
    <button class="primary" onclick="resolveTicket('${ticket.id}')">Resolve Ticket</button>
  `;
}

function markPending(id) {
  const tickets = getData('tickets', defaultTickets);
  const ticket = tickets.find((item) => item.id === id);
  if (ticket) ticket.status = 'Pending';
  saveData('tickets', tickets);
  renderTickets();
}

function resolveTicket(id) {
  const tickets = getData('tickets', defaultTickets);
  const archive = getData('archive', defaultArchive);
  const index = tickets.findIndex((item) => item.id === id);
  if (index === -1) return;

  const ticket = tickets[index];
  archive.unshift({
    id: ticket.id,
    student: ticket.student,
    department: ticket.department,
    issue: ticket.issue,
    resolvedBy: 'Demo Staff User',
    resolvedDate: new Date().toISOString().slice(0, 10),
    resolution: 'Ticket marked resolved in static demo.'
  });

  tickets.splice(index, 1);
  saveData('tickets', tickets);
  saveData('archive', archive);
  renderTickets();

  const detail = document.getElementById('ticketDetail');
  if (detail) detail.innerHTML = '<p>Ticket moved to archive.</p>';
}

function renderArchive() {
  const table = document.getElementById('archiveTable');
  if (!table) return;

  const archive = getData('archive', defaultArchive);
  const filter = document.getElementById('archiveDepartmentFilter')?.value || 'All';
  const filtered = filter === 'All' ? archive : archive.filter((ticket) => ticket.department === filter);

  table.innerHTML = filtered.map((ticket) => `
    <tr>
      <td>#${ticket.id}</td>
      <td>${ticket.student}</td>
      <td>${ticket.department}</td>
      <td>${ticket.issue}</td>
      <td>${ticket.resolvedBy}</td>
      <td>${ticket.resolvedDate}</td>
      <td>${ticket.resolution}</td>
    </tr>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderContentTable();
  renderTickets();
  renderArchive();

  const contentForm = document.getElementById('contentForm');
  if (contentForm) contentForm.addEventListener('submit', addDocument);

  const contentFilter = document.getElementById('contentFilter');
  if (contentFilter) contentFilter.addEventListener('change', renderContentTable);

  const ticketDepartmentFilter = document.getElementById('ticketDepartmentFilter');
  if (ticketDepartmentFilter) ticketDepartmentFilter.addEventListener('change', renderTickets);

  const ticketStatusFilter = document.getElementById('ticketStatusFilter');
  if (ticketStatusFilter) ticketStatusFilter.addEventListener('change', renderTickets);

  const archiveDepartmentFilter = document.getElementById('archiveDepartmentFilter');
  if (archiveDepartmentFilter) archiveDepartmentFilter.addEventListener('change', renderArchive);
});
