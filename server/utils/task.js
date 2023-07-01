const TASK_STATUS = ["todo", "ongoing", "finished"];
const validateTaskDescription = (description) => {
    return description.trim().length > 0;
};

const validateTaskStatus = (status) => {
    return TASK_STATUS.includes(status);
};

const validateTaskDueDate = (dueDate) => {
    const date = new Date(dueDate);
    return !isNaN(date);
};

module.exports = {
    validateTaskDescription,
    validateTaskStatus,
    validateTaskDueDate,
};
