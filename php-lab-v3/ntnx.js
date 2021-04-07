var NtnxDashboard;
NtnxDashboard = {

    /**
    *
    * @param {*} config
    *
    * Initialise the application
    *
    */
    init: function ( config )
    {
        this.config = config;
        this.setupGridster();
        this.setUI();
        this.bindEvents();

        /* load the saved/default dashboard when the DOM is ready */
        $( document).ready( function() {

            NtnxDashboard.loadLayout();

        });

    },
    /* init */

    /**
    *
    * @param {*} cell
    *
    * Remove existing contents of a specified DOM element
    *
    */
    resetCell: function( cell )
    {
        $( '#' + cell ).html( '<span class="gs-resize-handle gs-resize-handle-both"></span>' );
    },
    /* resetCell */

    /**
    *
    * @param {*} token
    * @param {*} cvmAddress
    * @param {*} username
    * @param {*} password
    * @param {*} entity
    * @param {*} pageElement
    * @param {*} elementTitle
    *
    * main function to build and send the entity list requests
    * the previous version of this used a single function for each request
    *
    */
    pcListEntities: function( token, cvmAddress, username, password, entity, pageElement, elementTitle ) {

        pcEntityInfo = $.ajax({
            url: '/ajax/pc-list-entities',
            type: 'POST',
            dataType: 'json',
            data: { _token: token, _cvmAddress: cvmAddress, _username: username, _password: password, _entity: entity, _pageElement: pageElement, _elementTitle: elementTitle },
        });

        pcEntityInfo.done( function(data) {

            NtnxDashboard.resetCell( pageElement );
            $( '#' + pageElement  ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">' + elementTitle + '</div><div>' + data.results.metadata.total_matches + '</div><div></div>');

            switch( entity ) {
                case 'project':

                    $( '#project_details' ).addClass( 'info_big' ).html( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Project List</div>' );

                    $( data.results.entities ).each( function( index, item ) {
                        $( '#project_details' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">' +  item.status.name + '</div>' );
                    });

                    $( '#project_details' ).append( '</div><div></div>' );

                default:
                    break;
            }

        });

    },
    /* pcListEntities */

    /**
    *
    * @param {*} token
    *
    * Remove the big graph DOM element from the page entirely
    * Legacy function from previous version, but may be used again
    *
    */
    removeGraph: function( token ) {
        var gridster = $( '.gridster ul' ).gridster().data( 'gridster' );
        var element = $( '#bigGraph' );
        gridster.remove_widget( element );
    },
    /* removeGraph */

    /**
    *
    * @param {*} token
    *
    * Revert the altered grid layout to the default from when the lab app was built
    *
    */
    restoreDefaultLayout: function( token ) {
        var gridster = $( '.gridster ul' ).gridster().data( 'gridster' );
        gridster.remove_all_widgets();

        /* AJAX call to get the default layout from the system's default dashboard */
        request = $.ajax({
            url: '/ajax/load-default',
            type: 'POST',
            dataType: 'json',
            data: { _token: token },
        });

        request.done( function(data) {
            serialization = Gridster.sort_by_row_and_col_asc( JSON.parse( data.layout ) );
            $.each( serialization, function() {
                gridster.add_widget('<li id="' + this.id + '" />', this.size_x, this.size_y, this.col, this.row);
            });

            NtnxDashboard.resetCell( 'footerWidget' );
            $( 'li#footerWidget' ).addClass( 'panel' ).append( '<div class="panel-body"><div id="controllerIOPS" style="height: 150px; width: 1000px; text-align: center;"></div></div>' );
            $( '#status_new' ).html( 'Default layout restored. Don\'t forget to save!' ).removeClass().addClass( 'alert' ).addClass( 'alert-warning' ).slideDown( 300 );
        });

        request.fail(function ( jqXHR, textStatus, errorThrown )
        {
            $( '#status_new' ).removeClass().html( textStatus + ' - ' + errorThrown ).addClass( 'alert' ).addClass( 'alert-error' );
        });

    },
    /* restoreDefaultLayout */

    /**
    *
    * @param {*} token
    *
    * Save the user's layout changes to on-disk JSON file
    *
    */
    saveLayout: function( token ) {
        /* get the gridster object */
        var gridster = $( '.gridster ul' ).gridster().data( 'gridster' );
        /* serialize the current layout */
        var json = gridster.serialize();

        /* convert the layout to json */
        var serialized = JSON.stringify( json );

        /* AJAX call to save the layout the app's configuration file */
        request = $.ajax({
            url: '/ajax/save-to-json',
            type: 'POST',
            dataType: 'json',
            data: { _token: token, _serialized: serialized },
        });

        request.done( function(data) {
            $( '#status_new' ).removeClass().html( 'Dashboard saved!' ).addClass( 'alert' ).addClass( 'alert-success' ).slideDown( 300 ).delay( 2000 ).slideUp( 300 );
        });

        request.fail(function ( jqXHR, textStatus, errorThrown )
        {
            $( '#status_new' ).removeClass().html( textStatus + ' - ' + errorThrown ).addClass( 'alert' ).addClass( 'alert-error' );
        });

    },
    /* saveLayout */

    /**
    *
    * Can't remember what this is for lol
    * Just kidding - it's for some tests carried out during development
    *
    */
    s4: function()
    {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    },
    /* s4 */

    /**
    *
    * Load the existing/saved grid layout from dashboard.json
    * This file holds the default layout if no changes have been made, or the layout setup by the user after saving
    *
    */
    loadLayout: function()
    {
        request = $.ajax({
            url: '/ajax/load-layout',
            type: 'POST',
            dataType: 'json',
            data: {},
        });

        var cvmAddress = $( '#cvmAddress' ).val();
        var username = $( '#username' ).val();
        var password = $( '#password' ).val();

        request.done( function( data ) {
            var gridster = $( '.gridster ul' ).gridster().data( 'gridster' );
            var serialization = JSON.parse( data.layout );

            serialization = Gridster.sort_by_row_and_col_asc(serialization);
            $.each( serialization, function() {
                gridster.add_widget('<li id="' + this.id + '" />', this.size_x, this.size_y, this.col, this.row);
            });

            /* add the chart markup to the largest containers */
            $( 'li#footerWidget' ).addClass( 'panel' ).append( '<div class="panel-body"><div id="controllerIOPS" style="height: 150px; width: 1000px; text-align: center;"></div></div>' );

            NtnxDashboard.resetCell( 'bigGraph' );
            $( '#bigGraph' ).addClass( 'info_hilite' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Hey ...</div><div>Enter your Prism Central details above, then click the Go button ...</div>');
            $( '#hints' ).addClass( 'info_hilite' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Also ...</div><div>Drag &amp; Drop<br>The Boxes</div>');

        });

        request.fail(function ( jqXHR, textStatus, errorThrown )
        {
            /* Display an error message */
            alert( 'Unfortunately an error occurred while processing the request.  Status: ' + textStatus + ', Error Thrown: ' + errorThrown );
        });
    },
    /* loadLayout */

    /**
    *
    * Setup the page's main grid
    *
    */
    setupGridster: function ()
    {
        $( function ()
        {

            var gridster = $( '.gridster ul' ).gridster( {
                widget_margins: [ 10, 10 ],
                widget_base_dimensions: [ 170, 170 ],
                max_cols: 10,
                autogrow_cols: true,
                resize: {
                    enabled: true
                },
                draggable: {
                    stop: function( e, ui, $widget ) {
                        $( '#status_new' ).html( 'Your dashboard layout has changed. Don\'t forget to save!' ).removeClass().addClass( 'alert' ).addClass( 'alert-warning' ).slideDown( 300 );
                    }
                },
                serialize_params: function ($w, wgd) {

                    return {
                        /* add element ID to data*/
                        id: $w.attr('id'),
                        /* defaults */
                        col: wgd.col,
                        row: wgd.row,
                        size_x: wgd.size_x,
                        size_y: wgd.size_y
                    }

                }
            } ).data( 'gridster' );

        } );
    },
    /* setupGridster */

    /**
    *
    * Apply tooltips to various elements and setup the delay on some animations
    *
    */
    setUI: function ()
    {

        $( 'div.alert-success' ).delay( 3000 ).slideUp( 1000 );
        $( 'div.alert-info' ).delay( 3000 ).slideUp( 1000 );

        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })

    },
    /* setUI */

    /**
    *
    * Bind events that will get triggered in response to various actions
    * In particular, button clicks
    *
    */
    bindEvents: function()
    {

        var self = NtnxDashboard;

        $( '#goButton' ).on( 'click', function ( e ) {

            var cvmAddress = $( '#cvmAddress' ).val();
            var username = $( '#username' ).val();
            var password = $( '#password' ).val();

            if( ( cvmAddress == '' ) || ( username == '' ) || ( password == '' ) )
            {
                NtnxDashboard.resetCell( 'bigGraph' );
                $( '#bigGraph' ).addClass( 'info_error' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Awww ...</div><div>Did you forget to enter something?</div>');
            }
            else
            {
                NtnxDashboard.resetCell( 'bigGraph' );
                $( '#bigGraph' ).html( '<span class="gs-resize-handle gs-resize-handle-both"></span>' ).removeClass( 'info_hilite' ).removeClass( 'info_error' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Ok ...</div><div>Gathering environment details ...</div>');
                NtnxDashboard.resetCell( 'hints' );
                $( '#hints' ).html( '<span class="gs-resize-handle gs-resize-handle-both"></span>' ).addClass( 'info_hilite' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Also ...</div><div>Drag &amp; Drop<br>The Boxes</div>');

                NtnxDashboard.pcListEntities( $( '#csrf_token' ).val(), cvmAddress, username, password, 'cluster', 'registered_clusters', 'Registered Clusters' );
                NtnxDashboard.pcListEntities( $( '#csrf_token' ).val(), cvmAddress, username, password, 'image', 'image_count', 'Images' );
                NtnxDashboard.pcListEntities( $( '#csrf_token' ).val(), cvmAddress, username, password, 'vm', 'vm_count', 'VMs' );
                NtnxDashboard.pcListEntities( $( '#csrf_token' ).val(), cvmAddress, username, password, 'host', 'host_count', 'Hosts &amp; PC Nodes' );
                NtnxDashboard.pcListEntities( $( '#csrf_token' ).val(), cvmAddress, username, password, 'project', 'project_count', 'Project Count' );
                NtnxDashboard.pcListEntities( $( '#csrf_token' ).val(), cvmAddress, username, password, 'app', 'app_count', 'Calm Apps' );

                NtnxDashboard.containerInfo( $( '#csrf_token' ).val(), cvmAddress, username, password, 'controllerIOPS', 'Controller IOPS' );

            }

            e.preventDefault();
        });

        $( '.saveLayout' ).on( 'click', function( e ) {
            NtnxDashboard.saveLayout( $( '#csrf_token' ).val() );
            e.preventDefault();
        });

        $( '.defaultLayout' ).on( 'click', function( e ) {
            NtnxDashboard.restoreDefaultLayout( $( '#csrf_token' ).val() );
            e.preventDefault();
        });

        $( '.removeGraph' ).on( 'click', function( e ) {
            NtnxDashboard.removeGraph( $( '#csrf_token' ).val() );
            e.preventDefault();
        });

    },
    /* bindEvents */

    containerInfo: function( token, cvmAddress, username, password ) {

        /* AJAX call to get some container stats */
        request = $.ajax({
            url: '/ajax/container-info',
            type: 'POST',
            dataType: 'json',
            data: { _token: token, _cvmAddress: cvmAddress, _username: username, _password: password },
        });

        request.done( function(data) {
            var plot1 = $.jqplot ('controllerIOPS', data.stats, {
                title: 'Controller Average I/O Latency',
                animate: true,
                axesDefaults: {
                    labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                    tickOptions: {
                        showMark: false,
                        show: true,
                    },
                    showTickMarks: false,
                    showTicks: false
                },
                seriesDefaults: {
                    rendererOptions: {
                        smooth: false
                    },
                    showMarker: false,
                    fill: true,
                    fillAndStroke: true,
                    color: '#b4d194',
                    fillColor: '#b4d194',
                    fillAlpha: '0.3',
                    // fillColor: '#bfde9e',
                    shadow: false,
                    shadowAlpha: 0.1,
                },
                axes: {
                    xaxis: {
                        min: 5,
                        max: 120,
                        tickOptions: {
                            showGridline: true,
                        }
                    },
                    yaxis: {
                        tickOptions: {
                            showGridline: false,
                        }
                    }
                }
            });

            NtnxDashboard.resetCell( 'containers' );
            $( '#containers' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Container(s)</div><div>' + data.containerCount + '</div><div></div>');

        });

    },
    /* containerInfo */

};

NtnxDashboard.init({

});
