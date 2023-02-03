import { CountUp } from './countUp.min.js';

var avaxPrice = 0
var gasPriceCounter = null
var burnedFeeCounter = null
var burnedFeeDollarsCounter = null
window.onload = function() {
  var options = {
    useEasing : true, 
    useGrouping : false, 
    separator : ' ', 
    decimal : '.', 
    prefix: '',
    suffix: ''
  };
  var options2 = {
    useEasing : true, 
    useGrouping : true,
    decimalPlaces: 2,
    separator : ' ', 
    decimal : '.', 
    prefix: '',
    suffix: ''
  };
  var options3 = {
    useEasing : true, 
    useGrouping : true,
    decimalPlaces: 0,
    separator : ' ', 
    decimal : '.', 
    prefix: '',
    suffix: '$'
  };
  gasPriceCounter = new CountUp('gasPrice', 0, options);
  gasPriceCounter.start();
  burnedFeeCounter = new CountUp('burnedFee', 0, options2);
  burnedFeeCounter.start();
  burnedFeeDollarsCounter = new CountUp('burnedFeeDollars', 0, options3);
  burnedFeeDollarsCounter.start();
}



var lists = [
      'https://raw.githubusercontent.com/all3kcis/avax-tokens/master/lists/custom.json',
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/blob/main/mc.tokenlist.json',
      'https://raw.githubusercontent.com/pangolindex/tokenlists/main/pangolin.tokenlist.json',
      'https://raw.githubusercontent.com/baguette-exchange/contracts/master/tokenlist/baguette.tokenlist.json',
      'https://raw.githubusercontent.com/elkfinance/tokens/main/avax.tokenlist.json'
    ]

    var blackList = [
      // Add here black listed tokens
    ]

    var tokens = {}
    
    function addList(name, version, timestamp, img, url){


      var th = $('<th>').attr('scope','row').html('<img width="35px" src="'+escapeHTML(img)+'" alt="'+escapeHTML(name)+'">')
      var td1 = $('<td>').addClass('bold').text(name)
      var td2 = $('<td>').text(version)
      var td3 = $('<td>').addClass('hide_on_small').text(timestamp)
      var td4 = $('<td>').html('<a href="'+escapeHTML(url)+'" target="_blank">Github</a>')
      var tr = $('<tr>').append(th)
      tr.append(td1)
      tr.append(td2)
      tr.append(td3)
      tr.append(td4)
      $('#lists tbody').append(tr)
    }

    function addToken(name, symbol, img, address){

      var th = $('<th>').attr('scope','row').html('<img width="35px" src="'+escapeHTML(img)+'" alt="'+escapeHTML(symbol)+'">')
      var td1 = $('<td>').addClass('tokens_name').text(name)
      var td2 = $('<td>').addClass('tokens_symbol').text(symbol)
      var td3 = $('<td>').html('<a href="https://cchain.explorer.avax.network/tokens/'+escapeHTML(address)+'/token-holders" target="_blank" class="explorer_url" data-toggle="tooltip" data-placement="bottom" title="Go to Avax explorer">'+escapeHTML(address).slice(0, 5)+'...'+escapeHTML(address).slice(-4)+'</a>')
      var td4 = $('<td>').html('<button type="submit" class="btn btn-secondary-alt copyAddr" data-addr="'+escapeHTML(address)+'" data-toggle="tooltip" data-placement="bottom" title="Copy"><i class="far fa-copy"></i></button><button type="submit" class="btn btn-secondary-alt shareToken" data-addr="'+escapeHTML(address)+'" data-toggle="tooltip" data-placement="bottom" title="Share"><i class="fas fa-share-alt"></i></button> <button type="submit" class="btn btn-secondary-alt addTokenToMetaMask" data-addr="'+escapeHTML(address)+'" data-toggle="tooltip" data-placement="bottom" title="Add to Metamask"><img src="assets/MetaMask_Fox.svg" alt="Metamask" width="20px"></button>')
      var tr = $('<tr>').append(th)
      tr.append(td1)
      tr.append(td2)
      tr.append(td3)
      tr.append(td4)
      $('#tokens tbody').append(tr)
    }

    function refreshTokensList(text){
      var tmp_tokens = {}
      var re = RegExp(text, 'gi');

      for (const [address, token ] of Object.entries(tokens)) {
        if( re.exec(token.name) !== null ||  re.exec(token.symbol) !== null){
          tmp_tokens[address]= token
        }
      }
      $('#tokens tbody').empty('')
      for (const [address, token ] of Object.entries(tmp_tokens)) {
        addToken(token.name, token.symbol, token.img, token.address)
      }
    }

    function escapeHTML(unsafe) {
      if(typeof unsafe == 'undefined')
        return ''
      return unsafe.replace(
          /[\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u00FF]/g,
          c => '&#' + ('000' + c.charCodeAt(0)).substr(-4, 4) + ';'
        )
    }

    async function loadProvider(){
      if (window.ethereum) {
        // Metamask injected
        window.web3 = new Web3(window.ethereum);
        console.log('Web3 Loaded by window.ethereum')
      } else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider)
        console.log('Web3 Loaded by window.web3')
      } else {
        console.log('No Metamask (or other Web3 Provider) installed')
      }
      var chainId = await web3.eth.getChainId()
      console.log('Local Provider ChainID :', chainId)
      if(chainId != 43114){
        $('#add_avalanche_network').show()
      }
      
    }
    loadProvider()

    async function getAvaxPrice(){
      $.get( "https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd", function( data ) {
        avaxPrice = data["avalanche-2"].usd
        $('#avaxPrice').text(avaxPrice+' $')
      });
    }

    async function connectMetamask(){
      try {
        await ethereum.enable();
        console.log('Web3 connected')
      } catch (err) {
        console.log('User denied account access', err)
      }
    }

    function isMetaMaskConnected() {
      return ethereum.selectedAddress != null
    }

    async function addTokenToMetaMask(address){
      await connectMetamask()
      console.log(tokens, address, tokens[address])
      try {
        // wasAdded is a boolean. Like any RPC method, an error may be thrown.
        const wasAdded = await ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20', // Initially only supports ERC20, but eventually more!
            options: {
              address: address, // The address that the token is at.
              symbol: tokens[address].symbol, // A ticker symbol or shorthand, up to 5 chars.
              decimals: tokens[address].decimals, // The number of decimals in the token
              image: tokens[address].img, // A string url of the token logo
            },
          },
        });

        if (wasAdded) {
          console.log('Thanks for your interest!');
        } else {
          console.log('Your loss!');
        }
      } catch (error) {
        console.log(error);
      }
    }


    

    $("#q").keyup(function() {
      // Search function
      refreshTokensList($(this).val())
    });

    const queryString = window.location.search;
    $( document ).ready(function() {

        window.web3_api = new Web3('https://api.avax.network/ext/bc/C/rpc')
        getAvaxPrice()
        updateGasPrice()
        setInterval(updateGasPrice, 10*1000);
        updateBurnedFee()
        setInterval(updateBurnedFee, 10*1000);


      $('#add_avalanche_network').on('click', async function() {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xA86A' }],
          });
          $('#add_avalanche_network').hide()
        } catch (e) {
          if (e.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xA86A',
                  chainName: 'Avalanche Network',
                  nativeCurrency:
                      {
                          name: 'AVAX',
                          symbol: 'AVAX',
                          decimals: 18
                      },
                  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
                  blockExplorerUrls: ['https://snowtrace.io/'],
              }],
              });
              $('#add_avalanche_network').hide()
            } catch (addError) {
              console.error(addError);
            }
          }
          // console.error(e)
        }
      })
      
      $.each(lists, function( index, url ) {
        $.ajax({
          url : url,
          type : "get",
          async: false,
          success : function(data) {
            var list = jQuery.parseJSON( data );
            addList(list.name, list.version.major+'.'+list.version.minor+'.'+list.version.patch, list.timestamp, list.logoURI, url)
            $.each(list.tokens, function( index, token ) {
              if(!blackList.includes(token.address.toLowerCase())){
                if(typeof tokens[token.address.toLowerCase()] == 'undefined'){
                  if(token.chainId == 43114){
                    //Mainnet
                    tokens[token.address.toLowerCase()] = {
                      address:token.address.toLowerCase(),
                      chainId:token.chainId,
                      decimals:token.decimals,
                      name:token.name,
                      symbol:token.symbol,
                      img:token.logoURI,
                      list:list.name,
                    }
                  }else{
                    // Fuji (43113) or others
                    //console.log(token)
                  }
                  
                }
              }             
            })
          },
          error: function() {
            console.log( "error" );
          }
        });
      });
      console.log(Object.keys(tokens).length, 'tokens loaded')

      var load=(function(){
        var i=0
        // Loading top 15 tokens
        for (const [address, token ] of Object.entries(tokens)) {
          if(i>=15) return false;
          addToken(token.name, token.symbol, token.img, token.address)
          i++
        }
      })()

      //console.log(queryString);
      const urlParams = new URLSearchParams(queryString);
      if(urlParams.get('a') != null){
        token = tokenByAddress(urlParams.get('a'))
        if(typeof token == 'object'){
          $('#q').val(token.symbol)
          $('#tokens tbody').empty('')
          addToken(token.name, token.symbol, token.img, token.address)
        }
      }

      
      
    });

    async function updateGasPrice(){
      var gasPrice = await window.web3_api.eth.getGasPrice()
      gasPriceCounter.update((gasPrice/10**9).toFixed(2));
    }

    async function updateBurnedFee(){
      var burnedFee = await window.web3_api.eth.getBalance("0x0100000000000000000000000000000000000000")
      burnedFee = burnedFee/10**18
      burnedFeeCounter.update(burnedFee)
      burnedFeeDollarsCounter.update(burnedFee*avaxPrice)
      
    }

    function numberWithSpaces(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }
    
    function tokenByAddress(addr){
      if(typeof addr == 'string'){
        for (const [address, token ] of Object.entries(tokens)) {
          if(addr.toLowerCase() == address.toLowerCase()){
            return token
          }
        }
      }
      return null
    }

    function copyToClipboard(text) {
      var dummy = document.createElement("textarea");
      document.body.appendChild(dummy);
      dummy.value = text;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
    }

    function addToast(text){
      var html ='<div class="toast" id="myToast" data-delay="3000"><div class="toast-header"><strong class="mr-auto">'+text+'</div></div>';
      //<button type="button" class="ml-2 mb-1 close" data-dismiss="toast">&times;</button>
      $('#toasts').html(html)
    }

    $("body").tooltip({
      selector: '[data-toggle="tooltip"]'
    });

    
    $('#connectMetamask').click(function() {
      connectMetamask();
    });

    $('body').on( "click", ".copyAddr", function() {
      copyToClipboard($(this).data('addr'));
      // Todo Notif / Animate on btn
      addToast('Address copied <i class="fas fa-check"></i>')
      $("#myToast").toast('show');
    });

    $('body').on( "click", ".addTokenToMetaMask", function() {
      addTokenToMetaMask($(this).data('addr'));
    });

    $('body').on( "click", ".shareToken", function() {
      var getUrl = window.location;
      var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
      copyToClipboard(baseUrl+'?a='+$(this).data('addr'));
      // Todo Notif / Animate on btn
      addToast('Share link copied <i class="fas fa-check"></i>')
      $("#myToast").toast('show');
    });
