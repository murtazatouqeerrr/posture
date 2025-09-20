document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('booking-form');
    const dateInput = document.getElementById('date');
    const timeSlotsContainer = document.getElementById('time-slots');

    dateInput.addEventListener('change', async () => {
        const selectedDate = dateInput.value;
        if (!selectedDate) return;

        try {
            const response = await fetch(`/api/availability?date=${selectedDate}`);
            const availableSlots = await response.json();
            renderTimeSlots(availableSlots);
        } catch (error) {
            console.error('Error fetching availability:', error);
            timeSlotsContainer.innerHTML = '<p class="text-red-500">Error fetching available slots.</p>';
        }
    });

    const renderTimeSlots = (slots) => {
        timeSlotsContainer.innerHTML = '';
        if (slots.length === 0) {
            timeSlotsContainer.innerHTML = '<p class="text-gray-500">No available slots for this date.</p>';
            return;
        }

        slots.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = 'flex items-center';
            slotElement.innerHTML = `
                <input type="radio" id="slot-${slot}" name="time_slot" value="${slot}" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500">
                <label for="slot-${slot}" class="ml-3 block text-sm font-medium text-gray-700">${slot}</label>
            `;
            timeSlotsContainer.appendChild(slotElement);
        });
    };

    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(bookingForm);
        const bookingData = Object.fromEntries(formData.entries());

        if (!bookingData.time_slot) {
            alert('Please select a time slot.');
            return;
        }

        try {
            const response = await fetch('/api/book-appointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
            });

            if (response.ok) {
                alert('Appointment booked successfully!');
                bookingForm.reset();
                timeSlotsContainer.innerHTML = '';
            } else {
                const error = await response.json();
                alert(`Booking failed: ${error.error}`);
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('An unexpected error occurred. Please try again.');
        }
    });
});
