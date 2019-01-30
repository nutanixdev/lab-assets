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

    physicalInfo: function( cvmAddress, username, password )
    {

	    physicalData = $.ajax({
		    url: '/ajax/physical-info',
		    type: 'POST',
		    dataType: 'json',
		    data: { _cvmAddress: cvmAddress, _username: username, _password: password },
	    });

        physicalData.success( function(data) {

            hostSerials = '';
            $.each( data['entities'], function() {
                hostSerials = hostSerials + 'S/N&nbsp;' + this.serial + '<br>';
            });
		
            NtnxDashboard.resetCell( 'hosts' );
                $( '#hosts' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">' + data['metadata']['count'] + ' Hosts</div>' );
                $( '#hosts' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">' + hostSerials + '</div>' );
            });

        physicalData.fail(function ( jqXHR, textStatus, errorThrown )
        {
            console.log('error getting physical info');
        });
    },

    vmInfo: function( cvmAddress, username, password )
    {

        vmData = $.ajax({
            url: '/ajax/vm-info',
            type: 'POST',
            dataType: 'json',
            data: { _cvmAddress: cvmAddress, _username: username, _password: password },
        });

        vmData.success( function(data) {
            NtnxDashboard.resetCell( 'vmInfo' );
            $( '#vmInfo' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">VM(s)</div><div>' + data['metadata']['count'] + '</div><div></div>');
        });

        vmData.fail(function ( jqXHR, textStatus, errorThrown )
        {
            console.log('error getting vm info')
        });
    },

    containerInfo: function( cvmAddress, username, password )
    {

        containerData = $.ajax({
            url: '/ajax/container-info',
            type: 'POST',
            dataType: 'json',
            data: { _cvmAddress: cvmAddress, _username: username, _password: password },
        });

        containerData.success( function(data) {
            NtnxDashboard.resetCell( 'containers' );
            $( '#containers' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Container(s)</div><div>' + data['metadata']['count'] + '</div><div></div>');
        });

        containerData.fail(function ( jqXHR, textStatus, errorThrown )
        {
            console.log('error getting container info')
        });
    },

    clusterInfo: function( cvmAddress, username, password )
    {

        clusterInfo = $.ajax({
            url: '/ajax/cluster-info',
            type: 'POST',
	    dataType: 'json',
            data: { _cvmAddress: cvmAddress, _username: username, _password: password },
        });

        clusterInfo.success( function(data) {
		
		cluster_entity = data['entities'][0];

            NtnxDashboard.resetCell( 'nosVersion' );
            $( '#nosVersion' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">AOS</div><div>' + cluster_entity['status']['resources']['config']['build']['version'] + '</div><div></div>');

            NtnxDashboard.resetCell( 'clusterSummary' );
            $( '#clusterSummary' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Cluster</div><div>' + cluster_entity['status']['name'] + '</div><div></div>');

            NtnxDashboard.resetCell( 'blocks' );
            $( '#blocks' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Hypervisors</div>' );
            $( '#blocks' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">' );

            ahv = false;
            vmware = false;
            hyperv = false;
            $( cluster_entity['status']['resources']['nodes']['hypervisor_server_list'] ).each( function( index, item ) {
                switch( item['type'] )
                {
                    case 'AHV':
                        if( ahv != true ) {
                            $( '#blocks' ).append( 'AHV<br>' );
                        }
                        ahv = true;
                        break;
                    case 'VMware':
                        $( '#blocks' ).append( 'ESXi<br>' );
                        break;
                    case 'Hyper-V':
                        $( '#blocks' ).append( 'Hyper-V<br>' );
                        break;
                }
            });

            $( '#blocks' ).append( '</div' );

        });

        clusterInfo.fail(function ( jqXHR, textStatus, errorThrown )
        {
            NtnxDashboard.resetCell( 'clusterSummary' );
            $( '#clusterSummary' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Cluster</div><div>' + textStatus + '</div><div></div>');
        });

    },

    storagePerformance: function( cvmAddress, username, password ) {

        /* AJAX call to get some container stats */
        request = $.ajax({
            url: '/ajax/storage-performance',
            type: 'POST',
            dataType: 'json',
            data: { _cvmAddress: cvmAddress, _username: username, _password: password },
        });

        request.success( function(data) {

            var plot1 = $.jqplot ('controllerIOPS', [ data['statsSpecificResponses'][0]['values'] ], {
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

    // removeGraph: function( token ) {
    //     var gridster = $( '.gridster ul' ).gridster().data( 'gridster' );
    //     var element = $( '#bigGraph' );
    //     gridster.remove_widget( element );
    // },

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
                $( '#bigGraph' ).html( '<span class="gs-resize-handle gs-resize-handle-both"></span>' ).removeClass( 'info_hilite' ).removeClass( 'info_error' ).addClass( 'info_big' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Ok ...</div><div>Let\'s test your cluster details ...</div>');
                NtnxDashboard.resetCell( 'hints' );
                $( '#hints' ).html( '<span class="gs-resize-handle gs-resize-handle-both"></span>' ).addClass( 'info_hilite' ).append( '<div style="color: #6F787E; font-size: 25%; padding: 10px 0 0 0;">Also ...</div><div>Drag &amp; Drop<br>The Boxes</div>');

                NtnxDashboard.clusterInfo( cvmAddress, username, password );
		
                NtnxDashboard.physicalInfo( cvmAddress, username, password );
                NtnxDashboard.vmInfo( cvmAddress, username, password );
                NtnxDashboard.storagePerformance( cvmAddress, username, password );
                NtnxDashboard.containerInfo( cvmAddress, username, password );
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


