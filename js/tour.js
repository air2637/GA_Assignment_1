  <script>
    $(function() {
        // Set up tour
        $('body').pagewalkthrough({
            name: 'introduction',
            steps: [{
                    popup: {
                        content: '#walkthrough-1',
                        type: 'modal'
                    }
                }, {
                    wrapper: '.legend',
                    popup: {
                        content: '#walkthrough-7',
                        type: 'tooltip',
                        position: 'left'
                    }
                },
                {
                    wrapper: '.leaflet-bar-part',
                    popup: {
                        content: '#walkthrough-8',
                        type: 'tooltip',
                        position: 'left'
                    }
                },
                {
                    wrapper: '.leaflet-control-layers-list',
                    popup: {
                        content: '#walkthrough-8',
                        type: 'tooltip',
                        position: 'left'
                    }
                }
            ]
        });

        // Show the tour
        $('body').pagewalkthrough('show');
    });
    </script>