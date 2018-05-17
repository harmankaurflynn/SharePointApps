'use strict';
var hostweburl;
var appweburl;
var listname;


var countTickerApp = angular.module('countTickerApp', []);
countTickerApp.controller('CountTickerController',
    function ($scope, $http) {
        hostweburl = decodeURIComponent($.getUrlVar("SPHostUrl"));
        appweburl = decodeURIComponent($.getUrlVar("SPAppWebUrl"));
        listname = decodeURIComponent($.getUrlVar("ListName"));
        
        $scope.countTickers = [];
        $scope.errormessage;
        $scope.erroroccurred = true;
        if (listname && listname != undefined && listname != "undefined") {
            $scope.erroroccurred = false;
            var scriptbase = hostweburl + "/_layouts/15/";
            $.getScript(scriptbase + "SP.Runtime.js",
                function () {
                    $.getScript(scriptbase + "SP.js",
                        function () {
                            $.getScript(scriptbase + "SP.RequestExecutor.js", function () {
                                var context = new SP.ClientContext(appweburl);
                                var factory = new SP.ProxyWebRequestExecutorFactory(appweburl);
                                context.set_webRequestExecutorFactory(factory);
                                var appContextSite = new SP.AppContextSite(context, hostweburl);
                                var web = appContextSite.get_web();
                                context.load(web);

                                var list = web.get_lists().getByTitle(listname);
                                var camlQuery = SP.CamlQuery.createAllItemsQuery();
                                this.listItems = list.getItems(camlQuery);
                                context.load(this.listItems);

                                context.executeQueryAsync(
                                    Function.createDelegate(this, function () {
                                       $scope.erroroccurred = false;
                                       
                                        var ListEnumerator = this.listItems.getEnumerator();
                                        while (ListEnumerator.moveNext()) {
                                            var currentItem = ListEnumerator.get_current();
                                            $scope.countTickers.push({
                                                title: currentItem.get_item('Title'),
                                                count: currentItem.get_item('Count')
                                            });


                                            $scope.$apply();

                                        }
                                    }),
                                    Function.createDelegate(this, function (sender, args) {
                                        $scope.errormessage = "An error occurred";
                                        $scope.erroroccurred = true;
                                    })
                                );

                            });
                        }
                    );
                }
            );
        }
        else
        {
            $scope.errormessage = "Select ListName in webpart properties";
            
        }
    }
);
jQuery.extend({
    getUrlVars: function () {
        var vars = [],
            hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    },
    getUrlVar: function (name) {
        return jQuery.getUrlVars()[name];
    }
});


