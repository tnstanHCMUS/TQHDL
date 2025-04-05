function showTask(taskId) {
    const allSections = document.querySelectorAll('.task-section');
    allSections.forEach(section => {
        section.classList.remove('active');
    });

    const target = document.getElementById(taskId);
    if (target) {
        target.classList.add('active');
    }
}
