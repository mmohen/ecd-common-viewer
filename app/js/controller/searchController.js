/**
 * Search Controller
 *
 */
viewerNS.SearchController = JClass._extend({

    textLayer: [],
    queryMatches: [],
    currentSearchPage: 1,
    currentMatchIdx: 0, //match index is 0 based
    highlightAllState: false,
    currentSearchQuery: '',  

    init: function(config, eventBus, mainController) {
        viewerNS.Util.initializeConfig(config, this);
        this.eventBus = eventBus;
        this.mainController = mainController;
        this.pageStore = mainController.pageStore;
        this.pageView = mainController.pageView;
        this.active = true;
        this.registerListeners();
    },

    registerListeners: function() {
        this.eventBus.addListener(this.viewerId + 'searchRequest', this.onSearchRequest.bind(this)); //from main controller
        this.eventBus.addListener(this.viewerId + 'pageNavigated', this.onPageNavigated.bind(this));
        this.eventBus.addListener(this.viewerId + 'destroy', this.destroy.bind(this));
    },

    onSearchRequest: function(searchRequest) {
        this.search(searchRequest.searchPhrase);
    },

    onPageNavigated: function(pageNo, totalPages) {
        this.currentlyNavigatedPage = pageNo;
    },

    search: function(searchPhrase, currentSearchPage) {
        var queryLen, query, pageStore, pageView, pageRecord, totalPages, data, bidiTexts;

        pageStore = this.mainController.pageStore;
        pageView = this.mainController.pageView;
        this.checkCurrentMatches(searchPhrase);

        query = searchPhrase;
        queryLen = query.length;
        totalPages = pageStore.getCount();
        if(!currentSearchPage){
          if(this.currentSearchPage != this.currentlyNavigatedPage){
            this.currentSearchPage = this.currentlyNavigatedPage;
            this.pagesSearchedForPhrase = 0;
            this.currentMatchIdx = 0;
          }
        }
        else{
          this.pagesSearchedForPhrase++;
        }
        this.debug('Search request for phrase : -'+searchPhrase + '- in page:'+ this.currentSearchPage);
        this.debug('Search request for phrase : -'+searchPhrase + '- search index:'+ this.currentMatchIdx);

        if (this.pagesSearchedForPhrase > totalPages ) {
          this.debug("No more search results found for search phrase "+ query);          
          this.checkedWholeDoc = false;
          return;
        }

        pageRecord = pageStore.getAt(this.currentSearchPage - 1);
        
        if (this.currentMatchIdx === 0) { //first search for that phrase on the page - do an actual search
          data = pageRecord.get('textContent');
          bidiTexts = [];
          if(!data){
              var me = this;
              this.retrievePageTextContent(pageRecord).then(function(){
                me.search(query, me.currentSearchPage);
              });
              return;            
          }
          if (data && data.items) {
            bidiTexts = data.items;
          }  
          str = '';         

          for (j = 0; j < bidiTexts.length; j++) {
            str += bidiTexts[j].str;
          }
          this.queryMatches[this.currentSearchPage] = this.searchQuery(query, str);
        }

        //using the query matches from first search

        //skip to checking for a match on the next page if there is not match for the current page 
        //or if this is the last match on the current page
        if (this.queryMatches[this.currentSearchPage].length === 0 || 
              this.queryMatches[this.currentSearchPage].length === this.currentMatchIdx) {
          //TODO only do this if/when the next page's view is rendered and text data is loaded 
          
          this.currentSearchPage++;
          if(this.currentSearchPage > totalPages){
            this.currentSearchPage = 1;
          }
          this.currentMatchIdx = 0; //TODO check this
          this.search(query, this.currentSearchPage);
          return;
        }
        dive = document.getElementById(pageView.getTextLayerId(this.currentSearchPage));
        //dive.scrollIntoView();
        this.mainController.assureDownload(pageRecord);
        this.mainController.requestRendering(pageRecord);  
        this.mainController.doRendering().then(this.highlightCurrentSearchHit.bind(this));      
        //this.highlightCurrentSearchHit();
    },

    retrievePageTextContent: function(pageRecord) {
        var page = pageRecord.get('pageRef');

        var promise = new Promise(function(resolve, reject){
          page.getTextContent().then(
              function textContentResolved(textContent) {
                  pageRecord.set('textContent', textContent);
                  resolve();
              }
          );        
        });
        return promise;
    },

    searchQuery: function(query, textString) {
        var matchIdx, matches, queryLen;
        queryLen = query.length;
        if (queryLen === 0) {
          return;
        }
        matches = [];
        matchIdx = -queryLen;
        while (true) {
          matchIdx = textString.indexOf(query, matchIdx + queryLen);
          if (matchIdx === -1) {
            break;
          }
          matches.push(matchIdx);
        }
        return matches;
    },    

    checkCurrentMatches: function(newSearchPhrase) {
        var query = newSearchPhrase;
        if (this.currentSearchQuery !== query) {
          if (this.currentSearchQuery !== '') {
            this.clearAllMatches();
            this.queryMatches = [];
            this.currentSearchPage = this.currentlyNavigatedPage;
            this.currentMatchIdx = 0;
            this.pagesSearchedForPhrase = 0;
          }
          this.currentSearchQuery = query;
        }
    },

    clearAllMatches: function() {
      var i, j, textLayerObject, pageNo;

      var pagesCount = this.mainController.pageStore.getCount();
      var pageView = this.mainController.pageView;

      for(i = 0; i< pagesCount; i++){
        pageNo = i + 1;
        textLayerObject = pageView.getTextLayerObject(pageNo);
        if (textLayerObject && this.queryMatches[i]) {
          var matches = this.queryMatches[i];
          for(j = 0; j< matches.length; j++){
            textLayerObject.clearMatch(this.queryMatches[i][j]);  
          }          
        }
      }

    },

    highlightCurrentSearchHit: function() {
        var pageStore = this.mainController.pageStore;
        var record, textlayerObject;
        if (pageStore) {
          record = pageStore.getAt(this.currentSearchPage - 1);
        }
        if (this.currentSearchQuery && record.get("renderingStatus") === pageStore.RENDERED) {
          this.debug("Highlighting search hit " + this.currentMatchIdx + " on page " + this.currentSearchPage);
          textlayerObject = this.pageView.getTextLayerObject(this.currentSearchPage);
          var updated = textlayerObject.updateMatches();
        }
    },

    updateMatchPosition: function(pageIndex, index, textDivs,
                    beginDivIdx, endDivIdx){
      if (this.currentMatchIdx === index &&
          this.currentSearchPage === pageIndex) {
        /*scrollIntoView(textDivs[beginIdx], {
          top: FIND_SCROLL_OFFSET_TOP,
          left: FIND_SCROLL_OFFSET_LEFT
        });*/
        this.currentMatchIdx++;
        if (this.currentMatchIdx > this.queryMatches[this.currentSearchPage].length) {
          this.currentSearchPage++;
          return this.currentMatchIdx = 0; //TODO check this
        }
        textDivs[beginDivIdx].scrollIntoView();
      }

    },

    log: function(msg) {
        return viewerNS.Util.Logger.log(msg);
    },

    debug: function(msg) {
        return viewerNS.Util.Logger.debug(msg);
    },    

    destroy: function() {
        this.currentSearchQuery = '';
        this.clearAllMatches();
        this.queryMatches = [];
        this.currentSearchPage = 1;
        this.currentMatchIdx = 0;
        this.pagesSearchedForPhrase = 0;
        this.eventBus.removeListener(this.viewerId + 'searchRequest', this.onSearchRequest.bind(this));
        this.eventBus.removeListener(this.viewerId + 'destroy', this.destroy.bind(this));
    }

});
