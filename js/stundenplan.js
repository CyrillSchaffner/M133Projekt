
$( document ).ready(function() {
    console.log("stundenplan.js");

    $('#berufe').append('<select></select>')

    $.getJSON('http://sandbox.gibm.ch/berufe.php').done(function(response) {
        console.log(response);
        response.forEach(function(r) {
            $('#berufe select').append('<option value='+r.beruf_id+'>'+r.beruf_name+'</option>');
        });
        $('#berufe');

    }).error(function(response) {
        $('#berufe').append('<br><label>Error</label>');
        console.log(response);
    });

    $('#berufe').on('change', function() {
        $.getJSON('https://sandbox.gibm.ch/klassen.php?beruf_id='+$('#berufe select').val())
            .done(function(response) {
                console.log(response)
                if (response) {
                    $('#klassen').empty();
                    $('#klassen').append('<select></select>');
                    response.forEach(function(r) {
                        $('#klassen select').append('<option value='+r.klasse_id+'>'+r.klasse_name+'</option>');
                    });
                } else {
                    $('#klassen').append('<br><label>Keine Klassen</label>');
                }
            }).error(function() {
                $('#klassen').append('<br><label>Keine Klassen</label>');
            });
    });

    $('#klassen').on('change', function() {
        $.getJSON('http://sandbox.gibm.ch/tafel.php?klasse_id='+$('#klassen select').val())
            .done(function(response) {
                console.log(response);
                if (response) {
                    $('#tafel').empty();
                    $('#tafel').append('<label></label>');
                    response.forEach(function(r) {
                        // TODO make this prettier
                        $('#tafel label').append('<br>'+r.tafel_bis+r.tafel_datum+r.tafel_fach+r.tafel_id+r.tafel_kommentar+r.tafel_lehrer+r.tafel_longfach+r.tafel_raum+r.tafel_von+r.tafel_wochentag);
                    });
                } else {
                    $('#klassen').append('<br><label>Kein Stundenplan</label>');
                }
            }).error(function() {
                $('#klassen').append('<br><label>Kein Stundenplan</label>');
            });
    });

});/// TODO save the selection in the localstorage