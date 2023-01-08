
$( document ).ready(function() {
    // appends select
    $('#berufe').append('<select class="btn btn-primary btn-light dropdown-toggle"></select>')

    const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

    var date = null;

    if (!(localStorage.getItem('date'))) {
        date = new Date();
        localStorage.setItem('date', date);

        $('#selectedWeek').empty();
        $('#selectedWeek').append(getWeekYearString(date));
    } else {
        const dateString = localStorage.getItem('date');
        date = new Date(Date.parse(dateString));
        refreshWeek();
        $('#selectedWeek').append(localStorage.getItem('week'))
    }

    // gets the whole stundenplan list and appends it to the select element
    $.getJSON('http://sandbox.gibm.ch/berufe.php').done(function(response) {
        console.log(response);

        // first emtpy option
        $('#berufe select').append('<option></option>');

        response.forEach(function(r) {
            console.log(r.beruf_id, r.beruf_name);
            // this checks for the empty option and doesnt do something
            // is needed becauce for some reason the empty option has the id 27
            // the empty option was already added
            if (r.beruf_name) {
                $('#berufe select').append('<option value='+r.beruf_id+'>'+r.beruf_name+'</option>');
            }
        });
        if (localStorage.getItem('beruf')) {
            $('#berufe select').val(localStorage.getItem('beruf'));
            refreshBeruf();
        }
    }).error(function(response) {
        $('#berufe').append('<br><label>Error</label>');
        console.log(response);
    });

    // if beruf is changed saves the option to localstorage and executes refreshBeruf
    $('#berufe').on('change', function() {
        localStorage.setItem('beruf', $('#berufe select').val())
        refreshBeruf();
    });

    // loads the options of the classes of the beruf
    function refreshBeruf() {
        $.getJSON('https://sandbox.gibm.ch/klassen.php?beruf_id='+$('#berufe select').val())
            .done(function(response) {
                console.log(response)
                if (response) {
                    $('#klassen').empty();
                    $('#klassen').append('<select class="btn btn-primary btn-light dropdown-toggle"></select>');
                    $('#klassen select').append('<option></option>');

                    response.forEach(function(r) {
                        $('#klassen select').append('<option value='+r.klasse_id+'>'+r.klasse_name+'</option>');
                    });
                    if (localStorage.getItem('klasse')) {
                        $('#klassen select').val(localStorage.getItem('klasse'));
                        refreshStundenplan();
                    }
                } else {
                    $('#klassen').append('<br><label>Keine Klassen</label>');
                }
            }).error(function() {
                $('#klassen').empty().append('<br><label>Keine Klassen</label>');
        });
    }

    // if the class gets selected
    $('#klassen').on('change', function() {
        localStorage.setItem('klasse', $('#klassen select').val())
        refreshStundenplan();
    } );

    // loads the stundenplan
    function refreshStundenplan() {
        if ($('#klassen select').val()) {
            console.log('http://sandbox.gibm.ch/tafel.php?klasse_id='+$('#klassen select').val()+"&woche="+getWeekYearString(date))
            $.getJSON('http://sandbox.gibm.ch/tafel.php?klasse_id='+$('#klassen select').val()+"&woche="+getWeekYearString(date))
                .done(function(response) {
                    console.log(response);
                    if (response) {
                        $('#tafel table').empty();

                        $('#tafel table').append('<thead class="thead-dark"></thead><tbody></tbody>')
                        $('#tafel table thead').append(
                            '<tr>' +
                            '<td>Datum</td>' +
                            '<td>Wochentag</td>' +
                            '<td>Von</td>' +
                            '<td>Bis</td>' +
                            '<td>Fach</td>' +
                            '<td>Lehrer</td>' +
                            '<td>Raum</td>' +
                            '<td>Kommentar</td>' +
                            '</tr>'
                        );

                        response.forEach(function(r) {
                            // TODO make this prettier
                            console.log(r)

                            const hoursVon = r.tafel_von.substring(0, 2);
                            const minutesVon = r.tafel_von.substring(3, 5);
                            const formattedTimeVon = `${hoursVon}:${minutesVon} Uhr`;

                            const hoursBis = r.tafel_bis.substring(0, 2);
                            const minutesBis = r.tafel_bis.substring(3, 5);
                            const formattedTimeBis = `${hoursBis}:${minutesBis} Uhr`;

                            $('#tafel tbody').append(
                                '<tr>' +
                                '<td>' + r.tafel_datum + '</td>' +
                                '<td>' + weekdays[r.tafel_wochentag] + '</td>' +
                                '<td>' + formattedTimeVon + '</td>' +
                                '<td>' + formattedTimeBis + '</td>' +
                                '<td>' + r.tafel_longfach + '</td>' +
                                '<td>' + r.tafel_lehrer + '</td>' +
                                '<td>' + r.tafel_raum + '</td>' +
                                '<td>' + r.tafel_kommentar + '</td>' +
                                '</tr>'
                            );

                        });
                    } else {
                        $('#klassen').append('<br><label>Kein Stundenplan</label>');
                    }
                }).error(function() {
                    $('#klassen').append('<br><label>Kein Stundenplan - Error</label>');
                });
        }
    }

    // returns full week string according to ISO 8601
    // used by api for the "tafel"
    function getWeekYearString(date) {
        // Get the year and week number
        var year = date.getFullYear();
        var weekNumber = getWeek(date);

        // Format the week number as a two-digit string
        var weekString = ('0' + weekNumber).slice(-2);

        // Return the formatted string like "02-2022"
        return weekString + '-' + year;
    }

    // returns weeknumber according to ISO 8601
    // Source: https://weeknumber.com/how-to/javascript
    function getWeek(date) {
        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        // January 4 is always in week 1.
        var week1 = new Date(date.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
            - 3 + (week1.getDay() + 6) % 7) / 7);
    }

    // button to go one week back
    $('#previousWeek').on('click', function() {
        date.setDate(date.getDate() - 7);
        refreshWeek();
    });

    // button to go one week forwards
    $('#nextWeek').on('click', function() {
        date.setDate(date.getDate() + 7);
        refreshWeek();
    });

    function refreshWeek() {
        localStorage.setItem('date', date)
        refreshStundenplan();
        $('#selectedWeek').empty();
        $('#selectedWeek').append(getWeekYearString(date));
    }

});// TODO save the selection in the localstorage

