export const formatDate = (date) => {
    const options = {year: 'numeric', month: '2-digit', day: '2-digit'};
    const timeOptions = {hour: '2-digit', minute: '2-digit', hour12: true};

    const dateString = date.toLocaleDateString('en-GB', options); // formats to day/month/year
    const timeString = date.toLocaleTimeString('en-US', timeOptions); // formats to hour:minute AM/PM

    return `${dateString} ${timeString}`;
};
