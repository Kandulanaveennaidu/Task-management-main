import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Chips } from 'primereact/chips';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Tag } from 'primereact/tag';
import { Avatar } from 'primereact/avatar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Panel } from 'primereact/panel';

// PrimeReact CSS imports
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// Ensure PrimeFlex is available for layout utilities like 'grid', 'col', 'flex', 'gap', etc.
// If not already globally available in the environment, you might need to add:
import 'primeflex/primeflex.css';

/**
 * Custom CSS for enhanced layout and styling to achieve a JIRA-like appearance.
 * This style block is embedded directly within the React component for demonstration.
 * In a larger application, these styles would typically reside in a separate CSS file.
 */
const customStyles = `
    .p-dialog-content {
        padding: 1.5rem !important; /* Ensure consistent padding inside dialogs */
    }

    .p-panel .p-panel-content {
        padding: 1.25rem; /* Consistent padding inside panels */
    }

    .p-panel {
        border: 1px solid var(--surface-border);
        border-radius: var(--border-radius);
        box-shadow: var(--surface-shadow); /* Subtle shadow for card effect */
    }

    /* Adjust spacing for form fields within panels */
    .p-panel .formgrid .field {
        margin-bottom: 1rem; /* Adjust vertical spacing between fields */
    }

    /* Remove bottom margin for the last field in a panel to avoid excess space */
    .p-panel .formgrid .field:last-child {
        margin-bottom: 0;
    }

    /* Style for the icon picker grid */
    .icon-picker-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(3rem, 1fr)); /* Increased minmax for larger items */
        gap: 0.75rem; /* Space between icons */
        padding: 0.75rem;
        border: 1px solid var(--surface-border);
        border-radius: var(--border-radius);
        background-color: var(--surface-100);
    }

    .icon-picker-item {
        width: 3rem; /* Increased size */
        height: 3rem; /* Increased size */
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--border-radius);
        cursor: pointer;
        transition: background-color 0.2s, border-color 0.2s;
    }

    .icon-picker-item:hover {
        background-color: var(--surface-200);
    }

    .icon-picker-item.selected {
        border: 2px solid var(--primary-color) !important; /* Highlight selected icon */
        background-color: var(--primary-color-light);
    }

    /* Style for dialog footers */
    .p-dialog-footer {
        padding: 1rem 1.5rem !important; /* Consistent padding for footer */
        border-top: 1px solid var(--surface-border); /* Separator line */
        background-color: var(--surface-0); /* Match background */
    }

    /* Specific adjustments for work type modal fields */
    .work-type-modal .field {
        margin-bottom: 1rem; /* Consistent spacing */
    }
    .work-type-modal .field:last-child {
        margin-bottom: 0; /* No extra margin for the last field */
    }

    /* Style for the basic file upload button */
    .p-fileupload-buttonbar .p-button {
        padding: 0.5rem 1rem; /* Adjust padding for a smaller button */
        font-size: 0.875rem; /* Smaller font size */
    }

    /* Landing Page Specific Styles */
    .landing-page-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 80vh; /* Occupy most of the viewport height */
        text-align: center;
        padding: 2rem;
    }

    .landing-page-title {
        font-size: 2.5rem; /* Large heading */
        font-weight: 700;
        color: var(--text-color);
        margin-bottom: 1rem;
    }

    .landing-page-description {
        font-size: 1.125rem; /* Readable paragraph text */
        color: var(--text-color-secondary);
        max-width: 600px;
        margin-bottom: 2rem;
    }

    .landing-page-button {
        padding: 1rem 2rem; /* Larger button */
        font-size: 1.25rem;
    }

    /* Removed .dropdown-separator as per user request */

    /* Custom styles for the icon upload area */
    .icon-upload-area {
        border: 2px dashed var(--surface-border);
        border-radius: var(--border-radius);
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        transition: background-color 0.2s;
        background-color: var(--surface-50);
    }
    .icon-upload-area:hover {
        background-color: var(--surface-100);
    }
    .icon-upload-area .p-fileupload-buttonbar {
        background: none;
        border: none;
        padding: 0;
    }
    .icon-upload-area .p-fileupload-content {
        display: none; /* Hide default content */
    }
`;

/**
 * TaskCreator Component
 * A React component that provides a JIRA-like interface for creating and managing tasks.
 * It utilizes PrimeReact components for all UI elements, ensuring a consistent look and feel.
 * This version includes Gemini API integrations for generating descriptions and suggesting labels,
 * and an enhanced layout using PrimeReact's Panel component for better visual organization.
 * The work type creation/editing and management modals have also been refined to match the JIRA-like design.
 */
const TaskCreator = () => {
    // State variables for managing dialog visibility and form data
    const [visible, setVisible] = useState(false); // Controls the main "Create Task" dialog visibility
    const [workTypeModalVisible, setWorkTypeModalVisible] = useState(false); // Controls the "Create/Edit Work Type" modal visibility
    const [linkedItemsVisible, setLinkedItemsVisible] = useState(false); // Controls the "Link Items" modal visibility
    const [createAnother, setCreateAnother] = useState(false); // Checkbox state for creating another task after submission
    const [iconPickerVisible, setIconPickerVisible] = useState(false); // Controls the "Choose an icon" modal visibility
    const toast = useRef(null); // Ref for PrimeReact Toast component to display messages

    // Work type definitions including statuses
    const initialWorkTypes = [
        {
            name: 'Task',
            icon: 'T',
            color: '#4c9aff',
            id: 'task',
            statuses: [
                'To Do',
                'In Progress',
                'In Review',
                'Ready for QA',
                'QA in Progress',
                'Blocked',
                'Done or Closed'
            ]
        },
        {
            name: 'Bug',
            icon: 'B',
            color: '#ff5630',
            id: 'bug',
            statuses: [
                'Open',
                'Triaged',
                'In Progress',
                'Ready for QA',
                'QA in Progress',
                'Reopened',
                'Blocked',
                'Closed',
                'Won\'t Fix',
                'Duplicate'
            ]
        },
        { name: 'Story', icon: 'S', color: '#36b37e', id: 'story', statuses: ['To Do', 'In Progress', 'Done'] },
        { name: 'Epic', icon: 'E', color: '#6554c0', id: 'epic', statuses: ['To Do', 'In Progress', 'Done'] }
    ];

    // State for work types
    const [workTypes, setWorkTypes] = useState(initialWorkTypes);

    // Mock data for existing work items to link
    const mockWorkItems = [
        { id: 'TMV-101', summary: 'Implement user authentication', type: 'Task' },
        { id: 'TMV-102', summary: 'Fix login redirection bug', type: 'Bug' },
        { id: 'TMV-103', summary: 'Develop dashboard UI', type: 'Story' },
        { id: 'WD-001', summary: 'Design homepage layout', type: 'Task' },
        { id: 'MA-005', summary: 'Crash on profile edit', type: 'Bug' },
    ];

    // Form data state for the main task creation form
    const [formData, setFormData] = useState(() => {
        const defaultWorkType = initialWorkTypes.find(wt => wt.id === 'task') || initialWorkTypes[0];
        return {
            project: { name: 'Task Management V2 (TMV)', code: 'TMV', avatar: 'T' },
            workType: defaultWorkType,
            summary: '',
            description: '',
            assignee: null,
            priority: { name: 'Medium', severity: 'info', value: 3 },
            labels: [],
            startDate: null,
            dueDate: null,
            originalEstimate: null,
            category: null,
            team: null,
            linkedWorkItems: [], // Array to store linked items
            attachments: [],
            status: defaultWorkType ? defaultWorkType.statuses[0] : null // Set initial status based on default work type
        };
    });

    // State for the work type creation/editing form
    const [workTypeForm, setWorkTypeForm] = useState({
        name: '',
        icon: '',
        color: '#4c9aff',
        description: '',
        statuses: ['To Do', 'In Progress', 'Done'] // Default statuses for new work types
    });

    // State for the linked items modal form
    const [linkedItemForm, setLinkedItemForm] = useState({
        relationship: 'blocks', // Default relationship
        linkedWorkItem: null,
    });

    const [editingWorkType, setEditingWorkType] = useState(null); // Stores the work type being edited
    const [errors, setErrors] = useState({}); // State for form validation errors

    // Static data
    const projects = [
        { name: 'Task Management V2 (TMV)', code: 'TMV', avatar: 'T' },
        { name: 'Website Development (WD)', code: 'WD', avatar: 'W' },
        { name: 'Mobile App (MA)', code: 'MA', avatar: 'M' }
    ];

    const priorities = [
        { name: 'Highest', severity: 'danger', value: 5, icon: 'pi pi-angle-double-up' },
        { name: 'High', severity: 'warning', value: 4, icon: 'pi pi-angle-up' },
        { name: 'Medium', severity: 'info', value: 3, icon: 'pi pi-minus' },
        { name: 'Low', severity: 'success', value: 2, icon: 'pi pi-angle-down' },
        { name: 'Lowest', severity: 'secondary', value: 1, icon: 'pi pi-angle-double-down' }
    ];

    const assignees = [
        { name: 'John Doe', email: 'john@example.com', avatar: 'JD', id: 1 },
        { name: 'Jane Smith', email: 'jane@example.com', avatar: 'JS', id: 2 },
        { name: 'Mike Johnson', email: 'mike@example.com', avatar: 'MJ', id: 3 },
        { name: 'Sarah Wilson', email: 'sarah@example.com', avatar: 'SW', id: 4 }
    ];

    const categories = [
        { name: 'Frontend', value: 'frontend' },
        { name: 'Backend', value: 'backend' },
        { name: 'Database', value: 'database' },
        { name: 'Testing', value: 'testing' },
        { name: 'DevOps', value: 'devops' },
        { name: 'Design', value: 'design' }
    ];

    const teams = [
        { name: 'Development Team', value: 'dev-team' },
        { name: 'QA Team', value: 'qa-team' },
        { name: 'Design Team', value: 'design-team' },
        { name: 'DevOps Team', value: 'devops-team' }
    ];

    const colors = [
        '#4c9aff', '#ff5630', '#36b37e', '#ffab00',
        '#6554c0', '#ff8b00', '#00875a', '#de350b',
        '#00b8d9', '#663399', '#ff9900', '#3366ff' // Added more colors
    ];

    // Predefined icons for the icon picker - Curated for better display and professionalism
    // Each icon now has a 'value' and a 'color'
    const predefinedIcons = [
        // Common UI
        { value: 'pi pi-home', color: colors[0] }, { value: 'pi pi-cog', color: colors[1] }, { value: 'pi pi-search', color: colors[2] },
        { value: 'pi pi-user', color: colors[3] }, { value: 'pi pi-users', color: colors[4] }, { value: 'pi pi-bell', color: colors[5] },
        { value: 'pi pi-envelope', color: colors[6] }, { value: 'pi pi-briefcase', color: colors[7] }, { value: 'pi pi-calendar', color: colors[8] },
        { value: 'pi pi-clock', color: colors[9] }, { value: 'pi pi-globe', color: colors[10] }, { value: 'pi pi-map-marker', color: colors[11] },
        { value: 'pi pi-info-circle', color: colors[0] }, { value: 'pi pi-question-circle', color: colors[1] }, { value: 'pi pi-exclamation-triangle', color: colors[2] },
        { value: 'pi pi-check-circle', color: colors[3] }, { value: 'pi pi-times-circle', color: colors[4] }, { value: 'pi pi-ban', color: colors[5] },
        { value: 'pi pi-filter', color: colors[6] }, { value: 'pi pi-print', color: colors[7] }, { value: 'pi pi-share-alt', color: colors[8] },
        { value: 'pi pi-link', color: colors[9] }, { value: 'pi pi-paperclip', color: colors[10] }, { value: 'pi pi-save', color: colors[11] },
        { value: 'pi pi-pencil', color: colors[0] }, { value: 'pi pi-copy', color: colors[1] }, { value: 'pi pi-trash', color: colors[2] },
        { value: 'pi pi-list', color: colors[3] }, { value: 'pi pi-bars', color: colors[4] }, { value: 'pi pi-table', color: colors[5] }, { value: 'pi pi-id-card', color: colors[6] },

        // Actions
        { value: 'pi pi-plus', color: colors[7] }, { value: 'pi pi-minus', color: colors[8] }, { value: 'pi pi-check', color: colors[9] },
        { value: 'pi pi-times', color: colors[10] }, { value: 'pi pi-refresh', color: colors[11] }, { value: 'pi pi-sync', color: colors[0] },
        { value: 'pi pi-undo', color: colors[1] }, { value: 'pi pi-download', color: colors[2] }, { value: 'pi pi-upload', color: colors[3] },
        { value: 'pi pi-sign-in', color: colors[4] }, { value: 'pi pi-sign-out', color: colors[5] }, { value: 'pi pi-lock', color: colors[6] },
        { value: 'pi pi-unlock', color: colors[7] }, { value: 'pi pi-eye', color: colors[8] }, { value: 'pi pi-eye-slash', color: colors[9] },
        { value: 'pi pi-star', color: colors[10] }, { value: 'pi pi-star-fill', color: colors[11] }, { value: 'pi pi-heart', color: colors[0] }, { value: 'pi pi-flag', color: colors[1] },

        // Objects & Items
        { value: 'pi pi-folder', color: colors[2] }, { value: 'pi pi-folder-open', color: colors[3] }, { value: 'pi pi-file', color: colors[4] },
        { value: 'pi pi-image', color: colors[5] }, { value: 'pi pi-camera', color: colors[6] }, { value: 'pi pi-book', color: colors[7] },
        { value: 'pi pi-tag', color: colors[8] }, { value: 'pi pi-bookmark', color: colors[9] }, { value: 'pi pi-ticket', color: colors[10] },
        { value: 'pi pi-palette', color: colors[11] }, { value: 'pi pi-key', color: colors[0] }, { value: 'pi pi-shield', color: colors[1] }, { value: 'pi pi-bolt', color: colors[2] },

        // Communication
        { value: 'pi pi-comment', color: colors[3] }, { value: 'pi pi-comments', color: colors[4] }, { value: 'pi pi-send', color: colors[5] },
        { value: 'pi pi-mobile', color: colors[6] }, { value: 'pi pi-phone', color: colors[7] },

        // Media
        { value: 'pi pi-play', color: colors[8] }, { value: 'pi pi-pause', color: colors[9] }, { value: 'pi pi-stop', color: colors[10] },
        { value: 'pi pi-volume-up', color: colors[11] }, { value: 'pi pi-microphone', color: colors[0] },

        // Data & Charts
        { value: 'pi pi-chart-bar', color: colors[1] }, { value: 'pi pi-chart-line', color: colors[2] }, { value: 'pi pi-server', color: colors[3] },
        { value: 'pi pi-database', color: colors[4] }, { value: 'pi pi-cloud', color: colors[5] },

        // Arrows
        { value: 'pi pi-arrow-up', color: colors[6] }, { value: 'pi pi-arrow-down', color: colors[7] }, { value: 'pi pi-arrow-left', color: colors[8] },
        { value: 'pi pi-arrow-right', color: colors[9] }, { value: 'pi pi-angle-up', color: colors[10] }, { value: 'pi pi-angle-down', color: colors[11] },
        { value: 'pi pi-angle-left', color: colors[0] }, { value: 'pi pi-angle-right', color: colors[1] },

        // Bug & Issue Related
        { value: 'pi pi-bug', color: colors[1] },             // Standard bug icon (often red/orange)
        { value: 'pi pi-exclamation-circle', color: colors[3] }, // Generic error/warning
        { value: 'pi pi-thumbs-down', color: colors[7] },    // Negative feedback/issue
        { value: 'pi pi-wrench', color: colors[0] },         // Fixing/maintenance
        { value: 'pi pi-code', color: colors[4] },           // Code related issues

        // Text based (for Avatar fallback)
        { value: 'T', color: colors[0] }, { value: 'B', color: colors[1] }, { value: 'S', color: colors[2] }, { value: 'E', color: colors[4] },
        { value: 'P', color: colors[5] }, { value: 'D', color: colors[6] }, { value: 'I', color: colors[7] } // Added 'I' for Issue
    ];

    const relationshipTypes = [
        { label: 'blocks', value: 'blocks' },
        { label: 'is blocked by', value: 'is blocked by' },
        { label: 'relates to', value: 'relates to' },
        { label: 'duplicates', value: 'duplicates' },
        { label: 'is duplicated by', value: 'is duplicated by' },
        { label: 'clones', value: 'clones' },
        { label: 'is cloned by', value: 'is cloned by' },
        { label: 'is parent of', value: 'is parent of' },
        { label: 'is child of', value: 'is child of' },
    ];


    // Template functions
    const projectOptionTemplate = (option) => {
        if (!option) return <span>Select project</span>;
        return (
            <div className="flex align-items-center gap-2">
                <Avatar
                    label={option.avatar}
                    className="mr-2"
                    size="small"
                    style={{ backgroundColor: '#0052cc', color: 'white' }}
                />
                <span>{option.name}</span>
            </div>
        );
    };

    const workTypeOptionTemplate = (option) => {
        if (!option) return <span>Select work type</span>;

        // Handle special options for create/edit
        if (option.id === 'create-new-work-type') {
            return (
                <div className="flex align-items-center gap-2 text-primary">
                    <i className="pi pi-plus"></i>
                    <span>{option.name}</span>
                </div>
            );
        }
        if (option.id === 'edit-selected-work-type') {
            return (
                <div className={`flex align-items-center gap-2 ${!formData.workType ? 'text-500-italic' : 'text-primary'}`}>
                    <i className="pi pi-pencil"></i>
                    <span>{option.name}</span>
                </div>
            );
        }

        // Default rendering for actual work types
        return (
            <div className="flex align-items-center gap-2">
                {/* Safely access option.icon using optional chaining or a conditional check */}
                {option.icon && (option.icon.startsWith('pi pi-') ? (
                    <i className={`${option.icon} text-xl`} style={{ color: option.color }}></i>
                ) : option.icon.startsWith('data:image/') ? ( // Render image if it's a base64 string
                    <img src={option.icon} alt="icon" className="w-1.5rem h-1.5rem" />
                ) : (
                    <Avatar
                        label={option.icon} // This might be undefined or empty for new items, handle gracefully
                        size="small"
                        style={{ backgroundColor: option.color, color: 'white' }}
                    />
                ))}
                <span>{option.name}</span>
            </div>
        );
    };

    const priorityOptionTemplate = (option) => {
        if (!option) return <span>Select priority</span>;
        return (
            <div className="flex align-items-center gap-2">
                <i className={`${option.icon} text-${option.severity}`}></i>
                <Tag severity={option.severity} value={option.name} />
            </div>
        );
    };

    const assigneeOptionTemplate = (option) => {
        if (!option) return <span>Select assignee</span>;
        return (
            <div className="flex align-items-center gap-2">
                <Avatar
                    label={option.avatar}
                    size="small"
                    style={{ backgroundColor: '#6c757d', color: 'white' }}
                />
                <div>
                    <div>{option.name}</div>
                    <small className="text-500">{option.email}</small>
                </div>
            </div>
        );
    };

    // Event handlers
    const handleInputChange = (field, value) => {
        // Special handling for workType dropdown to trigger modals
        if (field === 'workType') {
            if (value && value.id === 'create-new-work-type') {
                openCreateWorkType();
                // Reset dropdown to previous value or a default after action
                setFormData(prev => ({ ...prev, workType: workTypes.find(wt => wt.id === 'task') || workTypes[0] }));
                return;
            }
            if (value && value.id === 'edit-selected-work-type') {
                if (formData.workType && formData.workType.id) {
                    openEditWorkType(formData.workType);
                } else {
                    toast.current.show({
                        severity: 'warn',
                        summary: 'No Work Type Selected',
                        detail: 'Please select a work type to edit.'
                    });
                }
                // Reset dropdown to previous value or a default after action
                setFormData(prev => ({ ...prev, workType: workTypes.find(wt => wt.id === 'task') || workTypes[0] }));
                return;
            }
            // If a regular work type is selected, update status to its first status
            setFormData(prev => ({
                ...prev,
                workType: value,
                status: value.statuses && value.statuses.length > 0 ? value.statuses[0] : null
            }));
            if (errors[field]) {
                setErrors(prev => ({ ...prev, [field]: null }));
            }
            return; // Exit early as workType is handled
        }
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.summary.trim()) {
            newErrors.summary = 'Summary is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            toast.current.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Please fill in all required fields'
            });
            return;
        }

        const task = {
            id: Date.now(),
            ...formData,
            createdAt: new Date().toISOString(),
            status: 'To Do' // This will be overwritten by formData.status if it exists
        };

        console.log('Task created:', task);
        toast.current.show({
            severity: 'success',
            summary: 'Success',
            detail: `Task "${task.summary}" created successfully!`
        });

        if (createAnother) {
            resetForm();
        } else {
            setVisible(false);
        }
    };

    const resetForm = () => {
        const defaultWorkType = workTypes.find(wt => wt.id === 'task') || workTypes[0];
        setFormData({
            project: { name: 'Task Management V2 (TMV)', code: 'TMV', avatar: 'T' },
            workType: defaultWorkType,
            summary: '',
            description: '',
            assignee: null,
            priority: { name: 'Medium', severity: 'info', value: 3 },
            labels: [],
            startDate: null,
            dueDate: null,
            originalEstimate: null,
            category: null,
            team: null,
            linkedWorkItems: [],
            attachments: [],
            status: defaultWorkType ? defaultWorkType.statuses[0] : null
        });
        setErrors({});
    };

    // Work type management functions
    const openCreateWorkType = () => {
        setEditingWorkType(null); // No work type is being edited
        setWorkTypeForm({ name: '', icon: '', color: '#4c9aff', description: '', statuses: ['To Do', 'In Progress', 'Done'] }); // Reset description and default statuses
        setWorkTypeModalVisible(true);
    };

    const openEditWorkType = (workType) => {
        setEditingWorkType(workType); // Set the work type being edited
        setWorkTypeForm({ ...workType }); // Populate form with existing data
        setWorkTypeModalVisible(true);
    };

    /**
     * Handles the change of the selected work type within the edit modal dropdown.
     * Updates the form fields to reflect the newly selected work type's data.
     * @param {object} selectedWorkType - The work type object selected from the dropdown.
     */
    const handleEditWorkTypeDropdownChange = (selectedWorkType) => {
        setEditingWorkType(selectedWorkType);
        setWorkTypeForm({ ...selectedWorkType });
    };

    const saveWorkType = () => {
        if (!workTypeForm.name.trim() || !workTypeForm.icon.trim()) {
            toast.current.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Name and Icon are required'
            });
            return;
        }

        if (editingWorkType) {
            // If editing an existing work type
            setWorkTypes(prev => prev.map(wt =>
                wt.id === editingWorkType.id
                    ? { ...workTypeForm, id: editingWorkType.id }
                    : wt
            ));
            toast.current.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Work type updated successfully!'
            });
        } else {
            // If creating a new work type
            const newWorkType = {
                ...workTypeForm,
                id: Date.now().toString(),
                // Icon conversion logic: if it's a 'pi pi-' class, keep it as is, otherwise uppercase for text avatar
                icon: workTypeForm.icon.startsWith('pi pi-') || workTypeForm.icon.startsWith('data:image/') ? workTypeForm.icon : workTypeForm.icon.toUpperCase(),
                statuses: workTypeForm.statuses || ['New Status'] // Ensure statuses array exists for new types
            };
            setWorkTypes(prev => [...prev, newWorkType]);
            toast.current.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Work type created successfully!'
            });
        }

        setWorkTypeModalVisible(false);
    };

    const deleteWorkType = (workType) => {
        confirmDialog({
            message: `Are you sure you want to delete "${workType.name}" work type?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (workTypes.length <= 1) {
                    toast.current.show({
                        severity: 'warn',
                        summary: 'Warning',
                        detail: 'Cannot delete the last work type'
                    });
                    return;
                }

                setWorkTypes(prev => prev.filter(wt => wt.id !== workType.id));

                // If the deleted work type was currently selected in the main form,
                // set the selected work type to the first available one.
                if (formData.workType.id === workType.id) {
                    const newDefaultWorkType = workTypes.filter(wt => wt.id !== workType.id)[0];
                    setFormData(prev => ({
                        ...prev,
                        workType: newDefaultWorkType,
                        status: newDefaultWorkType ? newDefaultWorkType.statuses[0] : null
                    }));
                }

                toast.current.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Work type deleted successfully!'
                });
            }
        });
    };

    const onUpload = (event) => {
        const files = event.files;
        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...files]
        }));
        toast.current.show({
            severity: 'info',
            summary: 'Success',
            detail: `${files.length} file(s) uploaded`
        });
    };

    /**
     * Handles file selection for work type icon upload.
     * Reads the selected file as a Data URL (base64) and updates the workTypeForm.
     * @param {object} event - The FileUpload event object.
     */
    const onWorkTypeIconUpload = (event) => {
        const file = event.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setWorkTypeForm(prev => ({ ...prev, icon: e.target.result }));
                toast.current.show({
                    severity: 'success',
                    summary: 'Icon Uploaded',
                    detail: 'Image selected as icon.'
                });
            };
            reader.onerror = () => {
                toast.current.show({
                    severity: 'error',
                    summary: 'Upload Failed',
                    detail: 'Could not read the image file.'
                });
            };
            reader.readAsDataURL(file);
        }
    };

    /**
     * Handles icon selection from the icon picker modal.
     * @param {string} iconValue - The selected icon value (e.g., 'T' or 'pi pi-check').
     */
    const selectIcon = (iconValue) => {
        setWorkTypeForm(prev => ({ ...prev, icon: iconValue }));
        setIconPickerVisible(false); // Close the icon picker
    };

    /**
     * Handles adding a new linked work item.
     */
    const handleAddLinkedItem = () => {
        if (!linkedItemForm.linkedWorkItem || !linkedItemForm.relationship) {
            toast.current.show({ severity: 'error', summary: 'Validation Error', detail: 'Please select a relationship and a work item.' });
            return;
        }

        const newLinkedItem = {
            id: linkedItemForm.linkedWorkItem.id,
            summary: linkedItemForm.linkedWorkItem.summary,
            type: linkedItemForm.linkedWorkItem.type,
            relationship: linkedItemForm.relationship,
        };

        setFormData(prev => ({
            ...prev,
            linkedWorkItems: [...prev.linkedWorkItems, newLinkedItem]
        }));

        setLinkedItemForm({ relationship: 'blocks', linkedWorkItem: null }); // Reset form
        setLinkedItemsVisible(false); // Close modal
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Work item linked successfully!' });
    };

    /**
     * Handles removing a linked work item.
     * @param {string} itemId - The ID of the item to remove.
     */
    const handleRemoveLinkedItem = (itemId) => {
        setFormData(prev => ({
            ...prev,
            linkedWorkItems: prev.linkedWorkItems.filter(item => item.id !== itemId)
        }));
        toast.current.show({ severity: 'info', summary: 'Removed', detail: 'Linked item removed.' });
    };


    // Prepare dropdown options including special actions
    const dropdownWorkTypes = [
        ...workTypes,
        { name: 'Create New Work Type...', id: 'create-new-work-type' },
        { name: 'Edit Selected Work Type...', id: 'edit-selected-work-type' }
    ];

    // Get current statuses based on selected work type
    const currentStatuses = formData.workType?.statuses || [];

    return (
        <div className="p-4">
            {/* Inject custom styles */}
            <style>{customStyles}</style>

            {/* Toast component for displaying notifications */}
            <Toast ref={toast} />
            {/* ConfirmDialog component for user confirmations */}
            <ConfirmDialog />

            {/* Conditional rendering for Landing Page or Task Creation Dialog */}
            {!visible ? (
                <div className="landing-page-container">
                    <h1 className="landing-page-title">Welcome to Your Task Management System</h1>
                    <p className="landing-page-description">
                        Organize your projects, track your progress, and collaborate seamlessly.
                        Start by creating your first task!
                    </p>
                    <Button
                        label="Create Task"
                        icon="pi pi-plus"
                        onClick={() => setVisible(true)}
                        className="p-button-primary landing-page-button"
                    />
                </div>
            ) : (
                <Dialog
                    header="Create"
                    visible={visible}
                    style={{ width: '90vw', maxWidth: '900px' }}
                    onHide={() => setVisible(false)}
                    maximizable
                    modal
                >
                    <div className="formgrid grid p-fluid"> {/* Added p-fluid for consistent padding/sizing */}
                        <div className="field col-12" style={{ marginBottom: '2rem' }}>
                            <small className="text-500">
                                Required fields are marked with an asterisk <span className="text-red-500">*</span>
                            </small>
                        </div>

                        {/* Project Selection Field */}
                        <div className="field col-12" style={{ marginBottom: '2rem' }}>
                            <label htmlFor="project" className="block text-900 font-medium mb-2">
                                Project <span className="text-red-500">*</span>
                            </label>
                            <Dropdown
                                id="project"
                                value={formData.project}
                                options={projects}
                                onChange={(e) => handleInputChange('project', e.value)}
                                optionLabel="name"
                                itemTemplate={projectOptionTemplate}
                                valueTemplate={projectOptionTemplate}
                                className="w-full"
                            />
                        </div>

                        {/* Work Type Selection Field with integrated actions */}
                        <div className="field col-12" style={{ marginBottom: '2rem' }}> {/* Applied inline style for a larger gap */}
                            <label htmlFor="workType" className="block text-900 font-medium mb-2">
                                Work type <span className="text-red-500">*</span>
                            </label>
                            <Dropdown
                                id="workType"
                                value={formData.workType}
                                options={dropdownWorkTypes} // Use the combined list with special actions
                                onChange={(e) => handleInputChange('workType', e.value)}
                                optionLabel="name"
                                itemTemplate={workTypeOptionTemplate} // Custom template for rendering options
                                valueTemplate={workTypeOptionTemplate}
                                className="w-full"
                            />
                        </div>

                        {/* Details Panel */}
                        <div className="col-12" style={{ marginBottom: '2rem' }}>
                            <Panel header="Details" className="h-full">
                                <div className="formgrid grid p-fluid"> {/* Added p-fluid inside panel */}
                                    {/* Summary Input Field */}
                                    <div className="field col-12">
                                        <label htmlFor="summary" className="block text-900 font-medium mb-2">
                                            Summary <span className="text-red-500">*</span>
                                        </label>
                                        <InputText
                                            id="summary"
                                            value={formData.summary}
                                            onChange={(e) => handleInputChange('summary', e.target.value)}
                                            placeholder="Enter task summary"
                                            className={`w-full ${errors.summary ? 'p-invalid' : ''}`}
                                        />
                                        {errors.summary && <small className="p-error">{errors.summary}</small>}
                                    </div>

                                    {/* Description Textarea Field */}
                                    <div className="field col-12">
                                        <div className="flex justify-content-between align-items-center mb-2">
                                            <label htmlFor="description" className="block text-900 font-medium">Description</label>
                                        </div>
                                        <InputTextarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            placeholder="Have username, password, forgot password, register user this along with header and footer."
                                            rows={4}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Status Selection Field */}
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="status" className="block text-900 font-medium mb-2">Status</label>
                                        <Dropdown
                                            id="status"
                                            value={formData.status}
                                            options={currentStatuses}
                                            onChange={(e) => handleInputChange('status', e.value)}
                                            placeholder="Select status"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Assignee Selection Field */}
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="assignee" className="block text-900 font-medium mb-2">Assignee</label>
                                        <Dropdown
                                            id="assignee"
                                            value={formData.assignee}
                                            options={assignees}
                                            onChange={(e) => handleInputChange('assignee', e.value)}
                                            optionLabel="name"
                                            itemTemplate={assigneeOptionTemplate}
                                            valueTemplate={assigneeOptionTemplate}
                                            placeholder="Select assignee"
                                            className="w-full"
                                            showClear
                                        />
                                    </div>

                                    {/* Priority Selection Field */}
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="priority" className="block text-900 font-medium mb-2">Priority</label>
                                        <Dropdown
                                            id="priority"
                                            value={formData.priority}
                                            options={priorities}
                                            onChange={(e) => handleInputChange('priority', e.value)}
                                            optionLabel="name"
                                            itemTemplate={priorityOptionTemplate}
                                            valueTemplate={priorityOptionTemplate}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </Panel>
                        </div>

                        {/* Labels Panel */}
                        <div className="col-12" style={{ marginBottom: '2rem' }}>
                            <Panel header="Labels" className="h-full">
                                <div className="formgrid grid p-fluid"> {/* Added p-fluid inside panel */}
                                    <div className="field col-12">
                                        <div className="flex justify-content-between align-items-center mb-2">
                                            <label htmlFor="labels" className="block text-900 font-medium">Labels</label>
                                        </div>
                                        <Chips
                                            id="labels"
                                            value={formData.labels}
                                            onChange={(e) => handleInputChange('labels', e.value)}
                                            placeholder="Add labels (press Enter to add)"
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </Panel>
                        </div>

                        {/* Categorization & Dates Panel */}
                        <div className="col-12" style={{ marginBottom: '2rem' }}>
                            <Panel header="Categorization & Dates" className="h-full">
                                <div className="formgrid grid p-fluid"> {/* Added p-fluid inside panel */}
                                    {/* Start Date Calendar Field */}
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="startDate" className="block text-900 font-medium mb-2">Start date</label>
                                        <Calendar
                                            id="startDate"
                                            value={formData.startDate}
                                            onChange={(e) => handleInputChange('startDate', e.value)}
                                            placeholder="Select start date"
                                            className="w-full"
                                            showIcon
                                        />
                                    </div>

                                    {/* Due Date Calendar Field */}
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="dueDate" className="block text-900 font-medium mb-2">Due date</label>
                                        <Calendar
                                            id="dueDate"
                                            value={formData.dueDate}
                                            onChange={(e) => handleInputChange('dueDate', e.value)}
                                            placeholder="Select due date"
                                            className="w-full"
                                            showIcon
                                        />
                                    </div>

                                    {/* Original Estimate Input Number Field */}
                                    <div className="field col-12 md:col-4">
                                        <label htmlFor="originalEstimate" className="block text-900 font-medium mb-2">Original estimate (hours)</label>
                                        <InputNumber
                                            id="originalEstimate"
                                            value={formData.originalEstimate}
                                            onValueChange={(e) => handleInputChange('originalEstimate', e.value)}
                                            placeholder="0"
                                            className="w-full"
                                            min={0}
                                            max={1000}
                                        />
                                    </div>

                                    {/* Category Selection Field */}
                                    <div className="field col-12 md:col-4">
                                        <label htmlFor="category" className="block text-900 font-medium mb-2">Category</label>
                                        <Dropdown
                                            id="category"
                                            value={formData.category}
                                            options={categories}
                                            onChange={(e) => handleInputChange('category', e.value)}
                                            optionLabel="name"
                                            placeholder="Select category"
                                            className="w-full"
                                            showClear
                                        />
                                    </div>

                                    {/* Team Selection Field */}
                                    <div className="field col-12 md:col-4">
                                        <label htmlFor="team" className="block text-900 font-medium mb-2">Team</label>
                                        <Dropdown
                                            id="team"
                                            value={formData.team}
                                            options={teams}
                                            onChange={(e) => handleInputChange('team', e.value)}
                                            optionLabel="name"
                                            placeholder="Select team"
                                            className="w-full"
                                            showClear
                                        />
                                    </div>
                                </div>
                            </Panel>
                        </div>

                        {/* Linked Work Items Panel */}
                        <div className="col-12" style={{ marginBottom: '2rem' }}>
                            <Panel header="Linked Work Items" className="h-full">
                                <div className="formgrid grid p-fluid"> {/* Added p-fluid inside panel */}
                                    <div className="field col-12">
                                        <div className="flex justify-content-between align-items-center mb-2">
                                            <label className="block text-900 font-medium">Linked work items</label>
                                            <Button
                                                label="Link items"
                                                icon="pi pi-link"
                                                className="p-button-text p-button-sm"
                                                onClick={() => setLinkedItemsVisible(true)}
                                            />
                                        </div>
                                        {formData.linkedWorkItems.length > 0 ? (
                                            <div className="flex flex-column gap-2 mt-2">
                                                {formData.linkedWorkItems.map((item, index) => (
                                                    <div key={index} className="flex align-items-center justify-content-between p-2 surface-100 border-round">
                                                        <span className="text-600">{item.relationship}</span>
                                                        <Tag
                                                            value={`${item.type}: ${item.id} - ${item.summary}`}
                                                            icon="pi pi-link"
                                                            severity="info"
                                                            className="ml-2"
                                                        />
                                                        <Button
                                                            icon="pi pi-times"
                                                            className="p-button-rounded p-button-text p-button-danger p-button-sm ml-auto"
                                                            onClick={() => handleRemoveLinkedItem(item.id)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-500">No linked items.</p>
                                        )}
                                    </div>
                                </div>
                            </Panel>
                        </div>

                        {/* Attachments Panel */}
                        <div className="col-12" style={{ marginBottom: '2rem' }}>
                            <Panel header="Attachments" className="h-full">
                                <div className="formgrid grid p-fluid"> {/* Added p-fluid inside panel */}
                                    <div className="field col-12">
                                        <label htmlFor="attachments" className="block text-900 font-medium mb-2">Attachment</label>
                                        <FileUpload
                                            name="attachments"
                                            multiple
                                            accept="image/*,.pdf,.doc,.docx,.txt"
                                            maxFileSize={10000000}
                                            onUpload={onUpload}
                                            auto={false}
                                            chooseLabel="Choose Files"
                                            className="w-full"
                                        />
                                        {formData.attachments.length > 0 && (
                                            <div className="mt-2">
                                                <small className="text-500">
                                                    {formData.attachments.length} file(s) attached
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Panel>
                        </div>

                        {/* "Create Another" Checkbox" */}
                        <div className="field col-12" style={{ marginBottom: '2rem' }}>
                            <div className="flex align-items-center">
                                <Checkbox
                                    inputId="createAnother"
                                    checked={createAnother}
                                    onChange={(e) => setCreateAnother(e.checked)}
                                />
                                <label htmlFor="createAnother" className="ml-2">Create another</label>
                            </div>
                        </div>
                    </div>

                    {/* Dialog Footer Buttons */}
                    <div className="p-dialog-footer flex justify-content-between"> {/* Applied custom footer style */}
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            className="p-button-secondary"
                            onClick={() => setVisible(false)}
                        />
                        <Button
                            label="Create"
                            icon="pi pi-check"
                            className="p-button-primary"
                            onClick={handleSubmit}
                        />
                    </div>
                </Dialog>
            )}

            {/* Work Type Creation/Editing Modal */}
            <Dialog
                header={editingWorkType ? "Edit Work Type" : "Create Work Type"}
                visible={workTypeModalVisible}
                style={{ width: '450px' }}
                onHide={() => setWorkTypeModalVisible(false)}
                modal
            >
                <div className="formgrid grid p-fluid work-type-modal">
                    {editingWorkType ? (
                        <>
                            {/* Content for Edit Work Type (Matching Image 2) */}
                            <div className="field col-12 mb-3">
                                <small className="text-500">
                                    Required fields are marked with an asterisk <span className="text-red-500">*</span>
                                </small>
                            </div>
                            <div className="field col-12">
                                <label htmlFor="workTypeToEdit" className="block text-900 font-medium mb-2">
                                    Work type to edit
                                </label>
                                <Dropdown
                                    id="workTypeToEdit"
                                    value={editingWorkType}
                                    options={workTypes}
                                    onChange={(e) => handleEditWorkTypeDropdownChange(e.value)}
                                    optionLabel="name"
                                    itemTemplate={workTypeOptionTemplate}
                                    valueTemplate={workTypeOptionTemplate}
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12">
                                <label htmlFor="workTypeName" className="block text-900 font-medium mb-2">
                                    Work type name <span className="text-red-500">*</span>
                                </label>
                                <InputText
                                    id="workTypeName"
                                    value={workTypeForm.name}
                                    onChange={(e) => setWorkTypeForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter work type name"
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12">
                                <label htmlFor="workTypeDescription" className="block text-900 font-medium mb-2">
                                    Description
                                </label>
                                <InputTextarea
                                    id="workTypeDescription"
                                    value={workTypeForm.description}
                                    onChange={(e) => setWorkTypeForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Let people know when to use this work type."
                                    rows={3}
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12">
                                <div className="flex justify-content-between align-items-center mb-2">
                                    <label htmlFor="workTypeIcon" className="block text-900 font-medium">
                                        Icon <span className="text-red-500">*</span>
                                    </label>
                                    <Button
                                        label="Change icon"
                                        icon="pi pi-images"
                                        className="p-button-text p-button-sm"
                                        onClick={() => setIconPickerVisible(true)}
                                    />
                                </div>
                                <InputText
                                    id="workTypeIcon"
                                    value={workTypeForm.icon}
                                    onChange={(e) => setWorkTypeForm(prev => ({ ...prev, icon: e.target.value }))}
                                    placeholder="T"
                                    maxLength={20}
                                    className="w-full"
                                    disabled
                                />
                                {workTypeForm.icon && (
                                    <div className="mt-2 flex align-items-center gap-3"> {/* Changed gap-2 to gap-3 */}
                                        <span className="text-500">Current Icon:</span>
                                        {workTypeForm.icon.startsWith('pi pi-') ? (
                                            <i className={`${workTypeForm.icon} text-xl`} style={{ color: workTypeForm.color }}></i>
                                        ) : workTypeForm.icon.startsWith('data:image/') ? (
                                            <img src={workTypeForm.icon} alt="icon preview" className="w-2rem h-2rem border-round" />
                                        ) : (
                                            <Avatar
                                                label={workTypeForm.icon}
                                                size="small"
                                                style={{ backgroundColor: workTypeForm.color, color: 'white' }}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* <div className="field col-12">
                                <label className="block text-900 font-medium mb-2">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map(color => (
                                        <div
                                            key={color}
                                            className={`w-2rem h-2rem border-round cursor-pointer border-2 ${
                                                workTypeForm.color === color ? 'border-primary' : 'border-transparent'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setWorkTypeForm(prev => ({ ...prev, color }))}
                                        />
                                    ))}
                                </div>
                            </div> */}
                        </>
                    ) : (
                        <>
                            {/* Content for Create Work Type (Matching Image 1b) */}
                            <div className="field col-12">
                                <label htmlFor="workTypeName" className="block text-900 font-medium mb-2">
                                    Work type name <span className="text-red-500">*</span>
                                </label>
                                <InputText
                                    id="workTypeName"
                                    value={workTypeForm.name}
                                    onChange={(e) => setWorkTypeForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter work type name"
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12">
                                <label htmlFor="workTypeDescription" className="block text-900 font-medium mb-2">
                                    Description
                                </label>
                                <InputTextarea
                                    id="workTypeDescription"
                                    value={workTypeForm.description}
                                    onChange={(e) => setWorkTypeForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Let people know when to use this work type."
                                    rows={3}
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12">
                                <div className="flex justify-content-between align-items-center mb-2">
                                    <label htmlFor="workTypeIcon" className="block text-900 font-medium">
                                        Icon <span className="text-red-500">*</span>
                                    </label>
                                    <Button
                                        label="Change icon"
                                        icon="pi pi-images"
                                        className="p-button-text p-button-sm"
                                        onClick={() => setIconPickerVisible(true)}
                                    />
                                </div>
                                <InputText
                                    id="workTypeIcon"
                                    value={workTypeForm.icon}
                                    onChange={(e) => setWorkTypeForm(prev => ({ ...prev, icon: e.target.value }))}
                                    placeholder="T"
                                    maxLength={20}
                                    className="w-full"
                                    disabled
                                />
                                {workTypeForm.icon && (
                                    <div className="mt-2 flex align-items-center gap-3"> {/* Changed gap-2 to gap-3 */}
                                        <span className="text-500">Current Icon:</span>
                                        {workTypeForm.icon.startsWith('pi pi-') ? (
                                            <i className={`${workTypeForm.icon} text-xl`} style={{ color: workTypeForm.color }}></i>
                                        ) : workTypeForm.icon.startsWith('data:image/') ? (
                                            <img src={workTypeForm.icon} alt="icon preview" className="w-2rem h-2rem border-round" />
                                        ) : (
                                            <Avatar
                                                label={workTypeForm.icon}
                                                size="small"
                                                style={{ backgroundColor: workTypeForm.color, color: 'white' }}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* <div className="field col-12">
                                <label className="block text-900 font-medium mb-2">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map(color => (
                                        <div
                                            key={color}
                                            className={`w-2rem h-2rem border-round cursor-pointer border-2 ${
                                                workTypeForm.color === color ? 'border-primary' : 'border-transparent'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setWorkTypeForm(prev => ({ ...prev, color }))}
                                        />
                                    ))}
                                </div>
                            </div> */}
                        </>
                    )}
                </div>

                <div className="p-dialog-footer flex justify-content-end gap-2">
                    <Button
                        label="Cancel"
                        className="p-button-secondary"
                        onClick={() => setWorkTypeModalVisible(false)}
                    />
                    <Button
                        label={editingWorkType ? "Save" : "Create"}
                        className="p-button-primary"
                        onClick={saveWorkType}
                    />
                </div>
            </Dialog>

            {/* Choose an Icon Modal (Matching Image 1c) */}
            <Dialog
                header="Choose an icon"
                visible={iconPickerVisible}
                style={{ width: '500px' }}
                onHide={() => setIconPickerVisible(false)}
                modal
            >
                <div className="flex flex-column gap-3">
                    <div className="field">
                        <div className="icon-upload-area flex flex-column align-items-center justify-content-center gap-3">
                            <i className="pi pi-cloud-upload text-5xl text-400"></i>
                            <span className="text-lg text-600">Drag and drop your images here</span>
                            <span className="text-500">or</span>
                            {/* FileUpload component for "Upload a photo" */}
                            <FileUpload
                                mode="basic"
                                name="iconUpload"
                                accept="image/*"
                                maxFileSize={1000000} // 1MB
                                auto={false}
                                chooseLabel="Upload a photo"
                                onSelect={onWorkTypeIconUpload}
                                className="p-button-sm"
                            />
                        </div>
                    </div>

                    {/* Predefined Icon Selection */}
                    <div className="field">
                        <label className="block text-900 font-medium mb-2">Suggested Icons</label>
                        <div className="icon-picker-grid">
                            {predefinedIcons.map((item, index) => (
                                <div
                                    key={index}
                                    className={`icon-picker-item ${item.value === workTypeForm.icon ? 'selected' : ''}`}
                                    onClick={() => selectIcon(item.value)}
                                >
                                    {item.value.startsWith('pi pi-') ? (
                                        <i className={`${item.value} text-2xl`} style={{ color: item.color }}></i>
                                    ) : (
                                        <Avatar
                                            label={item.value}
                                            size="large"
                                            style={{ backgroundColor: item.color, color: 'white' }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-dialog-footer flex justify-content-end gap-2">
                    <Button
                        label="Cancel"
                        className="p-button-secondary"
                        onClick={() => setIconPickerVisible(false)}
                    />
                    <Button
                        label="Select"
                        className="p-button-primary"
                        onClick={() => setIconPickerVisible(false)}
                    />
                </div>
            </Dialog>

            {/* Linked Items Modal */}
            <Dialog
                header="Link Work Items"
                visible={linkedItemsVisible}
                style={{ width: '50vw', maxWidth: '600px' }}
                onHide={() => setLinkedItemsVisible(false)}
                modal
            >
                <div className="formgrid grid p-fluid">
                    <div className="field col-12 mb-3">
                        <label htmlFor="relationship" className="block text-900 font-medium mb-2">Relationship</label>
                        <Dropdown
                            id="relationship"
                            value={linkedItemForm.relationship}
                            options={relationshipTypes}
                            onChange={(e) => setLinkedItemForm(prev => ({ ...prev, relationship: e.value }))}
                            optionLabel="label"
                            placeholder="Select a relationship"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 mb-4">
                        <label htmlFor="linkedWorkItem" className="block text-900 font-medium mb-2">Select Work Item</label>
                        <Dropdown
                            id="linkedWorkItem"
                            value={linkedItemForm.linkedWorkItem}
                            options={mockWorkItems}
                            onChange={(e) => setLinkedItemForm(prev => ({ ...prev, linkedWorkItem: e.value }))}
                            optionLabel="summary"
                            placeholder="Search for work items..."
                            filter // Enable filtering for easier search
                            className="w-full"
                            itemTemplate={(option) => (
                                <div className="flex align-items-center gap-2">
                                    <Tag value={option.type} severity="info" />
                                    <span>{`${option.id}: ${option.summary}`}</span>
                                </div>
                            )}
                        />
                    </div>
                </div>
                <div className="p-dialog-footer flex justify-content-end gap-2">
                    <Button
                        label="Cancel"
                        className="p-button-secondary"
                        onClick={() => setLinkedItemsVisible(false)}
                    />
                    <Button
                        label="Add Link"
                        icon="pi pi-plus"
                        className="p-button-primary"
                        onClick={handleAddLinkedItem}
                    />
                </div>
            </Dialog>
        </div>
    );
};

export default TaskCreator;