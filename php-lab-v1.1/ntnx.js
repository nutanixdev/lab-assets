var NtnxDashboard;
NtnxDashboard = {

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

    resetCell: function( cell )
    {
        $( '#' + cell ).html( '<span class="gs-resize-handle gs-resize-handle-both"></span>' );
    },

    physicalInfo: function( token, cvmAddress, username, password )
    {
        physicalData = $.ajax({
            url: '/ajax/physical-info',
            type: 'POST',
            dataType: 'json',
            data: { _token: token, _cvmAddress: cvmAddress, _username: username, _password: password },
        });

        physicalData.success( function(data) {
            NtnxDashboard.resetCell( 'hosts' );
            $( '#hosts' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">' + data.hostCount + ' Hosts</div>' );
            $( '#hosts' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">' + data.hostSerials + '</div>' );
        });

        physicalData.fail(function ( jqXHR, textStatus, errorThrown )
        {
            $( '#status_new' ).removeClass().html( textStatus + ' - ' + errorThrown ).addClass( 'alert' ).addClass( 'alert-error' );
        });
    },

    vmInfo: function( token, cvmAddress, username, password )
    {

        vmData = $.ajax({
            url: '/ajax/vm-info',
            type: 'POST',
            dataType: 'json',
            data: { _token: token, _cvmAddress: cvmAddress, _username: username, _password: password },
        });

        vmData.success( function(data) {
            NtnxDashboard.resetCell( 'vmInfo' );
            $( '#vmInfo' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">VM(s)</div><div>' + data.vmCount + '</div><div></div>');
        });

        vmData.fail(function ( jqXHR, textStatus, errorThrown )
        {
            $( '#status_new' ).removeClass().html( textStatus + ' - ' + errorThrown ).addClass( 'alert' ).addClass( 'alert-error' );
        });
    },

    clusterInfo: function( token, cvmAddress, username, password )
    {

        clusterInfo = $.ajax({
            url: '/ajax/cluster-info',
            type: 'POST',
            dataType: 'json',
            data: { _token: token, _cvmAddress: cvmAddress, _username: username, _password: password },
        });

        clusterInfo.success( function(data) {
            NtnxDashboard.resetCell( 'nosVersion' );
            $( '#nosVersion' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">NOS</div><div>' + data.results.version + '</div><div></div>');

            NtnxDashboard.resetCell( 'clusterSummary' );
            $( '#clusterSummary' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Cluster</div><div>' + data.results.name + '</div><div></div>');

            NtnxDashboard.resetCell( 'blocks' );
            $( '#blocks' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Hypervisors</div>' );
            $( '#blocks' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">' );

            $( data.results.hypervisorTypes ).each( function( index, item ) {
                switch( item )
                {
                    case 'kKvm':
                        $( '#blocks' ).append( 'AHV' );
                        break;
                    case 'kVMware':
                        $( '#blocks' ).append( 'ESXi' );
                        break;
                    case 'kHyperv':
                        $( '#blocks' ).append( 'Hyper-V' );
                        break;
                }
            });

            $( '#blocks' ).append( '</div' );

        });

        clusterInfo.fail(function ( jqXHR, textStatus, errorThrown )
        {
            $( '#status_new' ).removeClass().html( textStatus + ' - ' + errorThrown ).addClass( 'alert' ).addClass( 'alert-error' );
        });

    },

    containerInfo: function( token, cvmAddress, username, password ) {

        /* AJAX call to get some container stats */
        request = $.ajax({
            url: '/ajax/container-info',
            type: 'POST',
            dataType: 'json',
            data: { _token: token, _cvmAddress: cvmAddress, _username: username, _password: password },
        });

        request.success( function(data) {
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

        request.fail(function ( jqXHR, textStatus, errorThrown )
        {
            $( '#status_new' ).removeClass().html( textStatus + ' - ' + errorThrown ).addClass( 'alert' ).addClass( 'alert-error' );
        });

    },

    removeGraph: function( token ) {
        var gridster = $( '.gridster ul' ).gridster().data( 'gridster' );
        var element = $( '#bigGraph' );
        gridster.remove_widget( element );
    },

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

        request.success( function(data) {
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

    serializeLayout: function( token ) {
        var gridster = $( '.gridster ul' ).gridster().data( 'gridster' );
        var json = gridster.serialize();
        $( '#serialized' ).html( JSON.stringify( json ) );
    },

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

        request.success( function(data) {
            $( '#status_new' ).removeClass().html( 'Dashboard saved!' ).addClass( 'alert' ).addClass( 'alert-success' ).slideDown( 300 ).delay( 2000 ).slideUp( 300 );
        });

        request.fail(function ( jqXHR, textStatus, errorThrown )
        {
            $( '#status_new' ).removeClass().html( textStatus + ' - ' + errorThrown ).addClass( 'alert' ).addClass( 'alert-error' );
        });

    },

    s4: function()
    {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    },

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

        request.success( function( data ) {
            var gridster = $( '.gridster ul' ).gridster().data( 'gridster' );
            var serialization = JSON.parse( data.layout );

            // $( '#serialized' ).html( data.layout );

            serialization = Gridster.sort_by_row_and_col_asc(serialization);
            $.each( serialization, function() {
                // gridster.add_widget('<li id="' + this.id + '"><div class="panel"><div class="panel-body"></div></div></li>', this.size_x, this.size_y, this.col, this.row);
                gridster.add_widget('<li id="' + this.id + '" />', this.size_x, this.size_y, this.col, this.row);
            });

            /* add the chart markup to the largest containers */
            // $( 'li#bigGraph' ).addClass( 'panel' ).append( '<div class="panel-body"><div id="chartdiv" style="height: 330px; width: 330px; text-align: center;"></div></div>' );
            $( 'li#footerWidget' ).addClass( 'panel' ).append( '<div class="panel-body"><div id="controllerIOPS" style="height: 150px; width: 1000px; text-align: center;"></div></div>' );

            NtnxDashboard.resetCell( 'bigGraph' );
            $( '#bigGraph' ).addClass( 'info_hilite' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Hey ...</div><div>Enter your cluster details above, then click the Go button ...</div>');
            $( '#hints' ).addClass( 'info_hilite' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Also ...</div><div>Drag &amp; Drop<br>The Boxes</div>');

        });

        request.fail(function ( jqXHR, textStatus, errorThrown )
        {
            /* Display an error message */
            alert( 'Unfortunately an error occurred while processing the request.  Status: ' + textStatus + ', Error Thrown: ' + errorThrown );
        });
    },

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

    setUI: function ()
    {

        // $( 'input#date' ).datepicker();

        $( 'div.alert-success' ).delay( 3000 ).slideUp( 1000 );
        $( 'div.alert-info' ).delay( 3000 ).slideUp( 1000 );

        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })

    },
    /* setUI */

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
                $( '#bigGraph' ).html( '<span class="gs-resize-handle gs-resize-handle-both"></span>' ).removeClass( 'info_hilite' ).removeClass( 'info_error' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Ok ...</div><div>Let\'s test your cluster details ...</div>');
                NtnxDashboard.resetCell( 'hints' );
                $( '#hints' ).html( '<span class="gs-resize-handle gs-resize-handle-both"></span>' ).addClass( 'info_hilite' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Also ...</div><div>Drag &amp; Drop<br>The Boxes</div>');

                NtnxDashboard.clusterInfo( $( '#csrf_token' ).val(), cvmAddress, username, password );
                NtnxDashboard.physicalInfo( $( '#csrf_token' ).val(), cvmAddress, username, password );
                NtnxDashboard.vmInfo( $( '#csrf_token' ).val(), cvmAddress, username, password );
                NtnxDashboard.containerInfo( $( '#csrf_token' ).val(), cvmAddress, username, password );
            }

            e.preventDefault();
        });

        $( '.serializeLayout' ).on( 'click', function( e ) {
            NtnxDashboard.serializeLayout( $( '#csrf_token' ).val() );
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

        $( '.containerStats' ).on( 'click', function( e ) {
            NtnxDashboard.containerInfo( $( '#csrf_token' ).val(), $( '#cvmAddress' ).val(), $( '#username' ).val(), $( '#password' ).val() );
            e.preventDefault();
        });

        $( '.testButton' ).on( 'click', function( e ) {
            $( '#clusterSummary' ).html( 'Hello' );
            e.preventDefault();
        });

    },
    /* bindEvents */

};

NtnxDashboard.init({

});