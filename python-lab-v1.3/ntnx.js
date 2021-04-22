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
    pcListEntities: function( cvmAddress, username, password, entity, pageElement, elementTitle ) {

        pcEntityInfo = $.ajax({
            url: '/ajax/pc-list-entities',
            type: 'POST',
            dataType: 'json',
            data: { _cvmAddress: cvmAddress, _username: username, _password: password, _entity: entity, _pageElement: pageElement, _elementTitle: elementTitle },
        });

        pcEntityInfo.done( function(data) {

            NtnxDashboard.resetCell( pageElement );
            $( '#' + pageElement  ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">' + elementTitle + '</div><div>' + data.metadata.total_matches + '</div><div></div>');

            switch( entity ) {
                case 'project':

                    $( '#project_details' ).addClass( 'info_big' ).html( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Project List</div>' );

                    $( data.entities ).each( function( index, item ) {
                        $( '#project_details' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">' +  item.status.name + '</div>' );
                    });

                    $( '#project_details' ).append( '</div><div></div>' );

                default:
                    break;
            }

        });

    },
    /* pcListEntities */

    storagePerformance: function( cvmAddress, username, password ) {

        /* AJAX call to get some container stats */
        request = $.ajax({
            url: '/ajax/storage-performance',
            type: 'POST',
            dataType: 'json',
            data: { _cvmAddress: cvmAddress, _username: username, _password: password, _entity: "containers" },
        });

        request.success( function(data) {

            var plot1 = $.jqplot ('controllerIOPS', [ data['stats_specific_responses'][0]['values'] ], {
                title: 'Controller Average I/O Latency (Last 4 Hours)',
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
            console.log('error getting data for performance chart');
        });

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

            serialization = Gridster.sort_by_row_and_col_asc(data);

            $.each( data, function() {
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
                $( '#bigGraph' ).html( '<span class="gs-resize-handle gs-resize-handle-both"></span>' ).removeClass( 'info_hilite' ).removeClass( 'info_error' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Ok ...</div><div>Gathering environment details...</div>');
                NtnxDashboard.resetCell( 'hints' );
                $( '#hints' ).html( '<span class="gs-resize-handle gs-resize-handle-both"></span>' ).addClass( 'info_hilite' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Also ...</div><div>Drag &amp; Drop<br>The Boxes</div>');

                // pcListEntities: function( cvmAddress, username, password, entity, pageElement, elementTitle ) {
                NtnxDashboard.pcListEntities( cvmAddress, username, password, "vm", 'vm_count', 'VMs' );
                NtnxDashboard.pcListEntities( cvmAddress, username, password, "cluster", 'registered_clusters', 'Registered Clusters' );
                NtnxDashboard.pcListEntities( cvmAddress, username, password, 'image', 'image_count', 'Images' );
                NtnxDashboard.pcListEntities( cvmAddress, username, password, 'host', 'host_count', 'Hosts &amp; PC Nodes' );
                NtnxDashboard.pcListEntities( cvmAddress, username, password, 'project', 'project_count', 'Project Count' );
                NtnxDashboard.pcListEntities( cvmAddress, username, password, 'app', 'app_count', 'Calm Apps' );

                NtnxDashboard.storagePerformance( cvmAddress, username, password, 'controllerIOPS', 'Controller IOPS' );

            }

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

    },
    /* bindEvents */

};

NtnxDashboard.init({

});

