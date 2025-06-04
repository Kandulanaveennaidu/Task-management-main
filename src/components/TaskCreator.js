import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Avatar } from 'primereact/avatar';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';

// PrimeReact CSS imports
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const customStyles = `
    .p-dialog-content {
        padding: 1.5rem !important;
    }

    .icon-picker-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(3rem, 1fr));
        gap: 0.75rem;
        padding: 0.75rem;
        border: 1px solid var(--surface-border);
        border-radius: var(--border-radius);
        background-color: var(--surface-100);
    }

    .icon-picker-item {
        width: 3rem;
        height: 3rem;
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
        border: 2px solid var(--primary-color) !important;
        background-color: var(--primary-color-light);
    }

    .p-dialog-footer {
        padding: 1rem 1.5rem !important;
        border-top: 1px solid var(--surface-border);
        background-color: var(--surface-0);
    }

    .work-type-modal .field {
        margin-bottom: 1rem;
    }

    .work-type-modal .field:last-child {
        margin-bottom: 0;
    }

    .p-fileupload-buttonbar .p-button {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
    }

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
        display: none;
    }
`;

const TaskCreator = () => {
    const [workTypeModalVisible, setWorkTypeModalVisible] = useState(false);
    const [iconPickerVisible, setIconPickerVisible] = useState(false);
    const toast = useRef(null);

    const initialWorkTypes = [
        {
            name: 'Task',
            icon: 'pi pi-check-square',
            color: '#4c9aff',
            id: 'task',
            statuses: [
                'To Do', 'In Progress', 'In Review', 'Ready for QA', 'QA in Progress', 'Blocked', 'Done or Closed'
            ]
        },
        // {
        //     name: 'Bug',
        //     icon: 'pi pi-bug',
        //     color: '#ff5630',
        //     id: 'bug',
        //     statuses: [
        //         'Open', 'Triaged', 'In Progress', 'Ready for QA', 'QA in Progress', 'Reopened', 'Blocked', 'Closed', 'Won\'t Fix', 'Duplicate'
        //     ]
        // },
        {
            name: 'Story',
            icon: 'pi pi-book',
            color: '#36b37e',
            id: 'story',
            statuses: ['To Do', 'In Progress', 'Done']
        },
        {
            name: 'Epic',
            icon: 'pi pi-sitemap',
            color: '#6554c0',
            id: 'epic',
            statuses: ['To Do', 'In Progress', 'Done']
        }
    ];

    const [workTypes, setWorkTypes] = useState(initialWorkTypes);

    const [formData, setFormData] = useState(() => {
        const defaultWorkType = initialWorkTypes.find(wt => wt.id === 'task') || workTypes[0];
        return {
            workType: defaultWorkType,
            status: defaultWorkType ? defaultWorkType.statuses[0] : null
        };
    });

    const [workTypeForm, setWorkTypeForm] = useState({
        name: '',
        icon: '',
        color: '#4c9aff',
        description: '',
        statuses: ['To Do', 'In Progress', 'Done']
    });

    const [editingWorkType, setEditingWorkType] = useState(null);
    const [errors, setErrors] = useState({});

    const colors = [
        '#4c9aff', '#ff5630', '#36b37e', '#ffab00',
        '#6554c0', '#ff8b00', '#00875a', '#de350b',
        '#00b8d9', '#663399', '#ff9900', '#3366ff'
    ];

    const predefinedIcons = [
        { value: 'pi pi-check-square', color: colors[0] },
        // { value: 'pi pi-bug', color: colors[1] },
        { value: 'pi pi-book', color: colors[2] },
        { value: 'pi pi-sitemap', color: colors[3] },
        { value: 'pi pi-home', color: colors[4] },
        { value: 'pi pi-cog', color: colors[5] },
        { value: 'pi pi-search', color: colors[6] },
        { value: 'pi pi-user', color: colors[7] },
        { value: 'pi pi-users', color: colors[8] },
        { value: 'pi pi-bell', color: colors[9] },
        { value: 'pi pi-envelope', color: colors[10] },
        { value: 'pi pi-briefcase', color: colors[11] },
        { value: 'pi pi-calendar', color: colors[0] },
        { value: 'pi pi-clock', color: colors[1] },
        { value: 'pi pi-globe', color: colors[2] },
        { value: 'pi pi-map-marker', color: colors[3] },
        { value: 'pi pi-info-circle', color: colors[4] },
        { value: 'pi pi-question-circle', color: colors[5] },
        { value: 'pi pi-exclamation-triangle', color: colors[6] },
        { value: 'pi pi-check-circle', color: colors[7] },
        { value: 'pi pi-times-circle', color: colors[8] },
        { value: 'pi pi-ban', color: colors[9] },
        { value: 'pi pi-filter', color: colors[10] },
        { value: 'pi pi-print', color: colors[11] },
        { value: 'pi pi-share-alt', color: colors[0] },
        { value: 'pi pi-link', color: colors[1] },
        { value: 'pi pi-paperclip', color: colors[2] },
        { value: 'pi pi-save', color: colors[3] },
        { value: 'pi pi-pencil', color: colors[4] },
        { value: 'pi pi-copy', color: colors[5] },
        { value: 'pi pi-trash', color: colors[6] },
        { value: 'pi pi-list', color: colors[7] },
        { value: 'pi pi-bars', color: colors[8] },
        { value: 'pi pi-table', color: colors[9] },
        { value: 'pi pi-id-card', color: colors[10] },
        { value: 'pi pi-plus', color: colors[11] },
        { value: 'pi pi-minus', color: colors[0] },
        { value: 'pi pi-check', color: colors[1] },
        { value: 'pi pi-times', color: colors[2] },
        { value: 'pi pi-refresh', color: colors[3] },
        { value: 'pi pi-sync', color: colors[4] },
        { value: 'pi pi-undo', color: colors[5] },
        { value: 'pi pi-download', color: colors[6] },
        { value: 'pi pi-upload', color: colors[7] },
        { value: 'pi pi-sign-in', color: colors[8] },
        { value: 'pi pi-sign-out', color: colors[9] },
        { value: 'pi pi-lock', color: colors[10] },
        { value: 'pi pi-unlock', color: colors[11] },
        { value: 'pi pi-eye', color: colors[0] },
        { value: 'pi pi-eye-slash', color: colors[1] },
        { value: 'pi pi-star', color: colors[2] },
        { value: 'pi pi-star-fill', color: colors[3] },
        { value: 'pi pi-heart', color: colors[4] },
        { value: 'pi pi-flag', color: colors[5] },
        { value: 'pi pi-folder', color: colors[6] },
        { value: 'pi pi-folder-open', color: colors[7] },
        { value: 'pi pi-file', color: colors[8] },
        { value: 'pi pi-image', color: colors[9] },
        { value: 'pi pi-camera', color: colors[10] },
        { value: 'pi pi-tag', color: colors[11] },
        { value: 'pi pi-bookmark', color: colors[0] },
        { value: 'pi pi-ticket', color: colors[1] },
        { value: 'pi pi-palette', color: colors[2] },
        { value: 'pi pi-key', color: colors[3] },
        { value: 'pi pi-shield', color: colors[4] },
        { value: 'pi pi-bolt', color: colors[5] },
        { value: 'pi pi-comment', color: colors[6] },
        { value: 'pi pi-comments', color: colors[7] },
        { value: 'pi pi-send', color: colors[8] },
        { value: 'pi pi-mobile', color: colors[9] },
        { value: 'pi pi-phone', color: colors[10] },
        { value: 'pi pi-play', color: colors[11] },
        { value: 'pi pi-pause', color: colors[0] },
        { value: 'pi pi-stop', color: colors[1] },
        { value: 'pi pi-volume-up', color: colors[2] },
        { value: 'pi pi-microphone', color: colors[3] },
        { value: 'pi pi-chart-bar', color: colors[4] },
        { value: 'pi pi-chart-line', color: colors[5] },
        { value: 'pi pi-server', color: colors[6] },
        { value: 'pi pi-database', color: colors[7] },
        { value: 'pi pi-cloud', color: colors[8] },
        { value: 'pi pi-arrow-up', color: colors[9] },
        { value: 'pi pi-arrow-down', color: colors[10] },
        { value: 'pi pi-arrow-left', color: colors[11] },
        { value: 'pi pi-arrow-right', color: colors[0] },
        { value: 'pi pi-angle-up', color: colors[1] },
        { value: 'pi pi-angle-down', color: colors[2] },
        { value: 'pi pi-angle-left', color: colors[3] },
        { value: 'pi pi-angle-right', color: colors[4] },
        { value: 'pi pi-exclamation-circle', color: colors[5] },
        { value: 'pi pi-thumbs-down', color: colors[6] },
        { value: 'pi pi-wrench', color: colors[7] },
        { value: 'pi pi-code', color: colors[8] },
        { value: 'T', color: colors[9] },
        { value: 'B', color: colors[10] },
        { value: 'S', color: colors[11] },
        { value: 'E', color: colors[0] },
        { value: 'P', color: colors[1] },
        { value: 'D', color: colors[2] },
        { value: 'I', color: colors[3] }
    ];

    const workTypeOptionTemplate = (option) => {
        if (!option) return <span>Select work type</span>;
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
        return (
            <div className="flex align-items-center gap-2">
                {option.icon && (
                    <i className={`${option.icon} text-xl`} style={{ color: option.color }}></i>
                )}
                <span>{option.name}</span>
            </div>
        );
    };

    const handleInputChange = (field, value) => {
        if (field === 'workType') {
            if (value && value.id === 'create-new-work-type') {
                openCreateWorkType();
                setFormData(prev => ({ ...prev, workType: prev.workType || (workTypes.find(wt => wt.id === 'task') || workTypes[0]) }));
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
                setFormData(prev => ({ ...prev, workType: prev.workType || (workTypes.find(wt => wt.id === 'task') || workTypes[0]) }));
                return;
            }
            setFormData(prev => ({
                ...prev,
                workType: value,
                status: value.statuses && value.statuses.length > 0 ? value.statuses[0] : null
            }));
            return;
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const openCreateWorkType = () => {
        setEditingWorkType(null);
        setWorkTypeForm({ name: '', icon: '', color: '#4c9aff', description: '', statuses: ['To Do', 'In Progress', 'Done'] });
        setWorkTypeModalVisible(true);
    };

    const openEditWorkType = (workType) => {
        const workTypeToEdit = workTypes.find(wt => wt.id === workType.id);
        if (workTypeToEdit) {
            setEditingWorkType(workTypeToEdit);
            setWorkTypeForm({ ...workTypeToEdit });
        } else {
            console.warn("Work type not found in workTypes array:", workType);
            setEditingWorkType(workType);
            setWorkTypeForm({ ...workType });
        }
        setWorkTypeModalVisible(true);
    };

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

            setFormData(prev => ({
                ...prev,
                workType: { ...workTypeForm, id: editingWorkType.id }
            }));
        } else {
            const newWorkType = {
                ...workTypeForm,
                id: Date.now().toString(),
                icon: workTypeForm.icon.startsWith('pi pi-') || workTypeForm.icon.startsWith('data:image/') ? workTypeForm.icon : workTypeForm.icon.toUpperCase(),
                statuses: workTypeForm.statuses || ['New Status']
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

    const selectIcon = (iconValue) => {
        setWorkTypeForm(prev => ({ ...prev, icon: iconValue }));
        setIconPickerVisible(false);
    };

    const dropdownWorkTypes = [
        ...workTypes,
        { name: 'Create New Work Type...', id: 'create-new-work-type' },
        { name: 'Edit Selected Work Type...', id: 'edit-selected-work-type' }
    ];

    return (
        <div className="p-4">
            <style>{customStyles}</style>
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="formgrid grid p-fluid" style={{ maxWidth: '500px', margin: 'auto' }}>
                <div className="field col-12" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="workType" className="block text-900 font-medium mb-2">
                        Work type <span className="text-red-500">*</span>
                    </label>
                    <Dropdown
                        id="workType"
                        value={formData.workType}
                        options={dropdownWorkTypes}
                        onChange={(e) => handleInputChange('workType', e.value)}
                        optionLabel="name"
                        itemTemplate={workTypeOptionTemplate}
                        valueTemplate={workTypeOptionTemplate}
                        className="w-full"
                    />
                </div>
            </div>

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
                                        style={{ width: '89%' }}
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
                                    <div className="mt-2 flex align-items-center gap-3">
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
                        </>
                    ) : (
                        <>
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
                                        style={{ width: '89%' }}
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
                                    <div className="mt-2 flex align-items-center gap-3">
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
                            <FileUpload
                                mode="basic"
                                name="iconUpload"
                                accept="image/*"
                                maxFileSize={1000000}
                                auto={false}
                                chooseLabel="Upload a photo"
                                onSelect={onWorkTypeIconUpload}
                                className="p-button-sm"
                            />
                        </div>
                    </div>

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
        </div>
    );
};

export default TaskCreator;