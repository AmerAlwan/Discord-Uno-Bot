const Discord = require('discord.js');
const fs = require('fs');

const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const ms = require('ms');

const token = 'Njk4NTc1ODE0OTc1MDI5MzMw.XpPtPw.KdlLwC2N6IZbJ_4CCRPRTbgAsjA';

const PREFIX = '!';

var gameStart = false;
var initGame = false;
var canPart = true;
var nextPlayer = false;
var doneTurn = false;
//var players = [];
var messagesToDelete = 0;
var messages = 0;
var cardColor;
var cardNum;

var deck = [];
var sDeck = [];

var players = [];

var ord = 0;
var order = [];

var changeColor = false;

var playerBot = false;
var next = false;

var prevPlayer = null;
var prevPlayerCards;

var round = 1;



bot.on('ready', () => {
    console.log('Uno Time!');
})

bot.on('message', async message => {
    let args = message.content.toLowerCase().substring(PREFIX.length).split(" ");

    if (playerBot) {
        await sleep(3000);
        args[0] = 'play';
    }

    //switch(args[0]) {

    if (args[0] === 'start') {
        if (!nextPlayer) {
            canPart = false;
            initGame = true;
            ord = players.length;
            args[0] = 'next';
            message.channel.send("Game Started!");
            message.channel.send("Players: ");
            for (i = 0; i < players.length; i++) {

                await message.channel.send((i + 1) + ": " + players[i]['name']);
                // console.log("deck3");
                //console.log(players[i]['deck']);
                order.push(i);
                if (!players[i]['bot']) {
                    await message.guild.members.cache.get(players[i]['id']).roles.remove(players[i]['role']);
                    await message.guild.members.cache.get(players[i]['id']).roles.add('698737416122531922');
                }
            }
            var randCard = Math.floor(Math.random() * deck.length);
            //message.channel.send("<:" + deck[randCard]['name'] + ":" + deck[randCard]['id'] + ">");
            sDeck.push(deck[randCard]);
            cardColor = deck[randCard]['color'];
            cardNum = deck[randCard]['num'];
            deck.splice(randCard, 1);

        } else {
            message.channel.send("Game has already started!");
        }
    }



    if (args[0] === 'uno') {
        if (!gameStart) {
            message.channel.send('time!');
            gameStart = true;
            deck = shuffleDeck(generateDeck());
            message.channel.send('Deck Shuffled!');
        } else {
            message.channel.send("There already is an ongoing game!");
        }

        //displayDeck(deck, message, 'Here is the Shuffled Deck!');
    }

    if (args[0] === 'join') {
        if (gameStart && canPart) {
            var decks = getDeck(deck, 8);
            deck = decks[0];
            var pRole;
            // {name: "", num:cardInfo[0], color:cardInfo[1], id:cardInfo[2].substring(0, cardInfo[2].indexOf('.'))};
            // var checkCard = {name:"c", num:0, color:0, id:'☑️'};
            // decks[1].push(checkCard);
            if (args.length > 1 && args[1] === 'bot') {
                var bot = { name: "AI Bot " + (ord + 1), id: '', deck: decks[1], order: ord, selected: [], role: '', bot: true };
                players.push(bot);
                message.channel.send("AI Bot was generated and has joined the game!");
            } else {
                if (message.member.roles.cache.has('698737360946462762')) {
                    pRole = '698737360946462762';
                } else if (message.member.roles.cache.has('698869505144651826')) {
                    pRole = '698869505144651826';
                }

                ////////
                // var card = { name: "Reverse_y", num: '11', color: 'y', id: '698871055900475412' };
                // decks[1].push(card);
                // card = { name: "changeColor_a", num: '14', color: 'a', id: '698900523981733888' };
                // decks[1].push(card);
                ////////
                var player = { name: message.member.displayName, id: message.member.user.id, deck: decks[1], order: ord, selected: [], role: pRole, bot: false };

                if (!checkIncludes(players, player, 0, 'id')) {
                    players.push(player);
                    message.reply("Your deck has been generated! Your order in the game is " + (ord + 1) + ". Enjoy the game!");
                    //console.log(player['deck']);
                    // displayDeck(player['deck'], message, 'Here is your deck, ' + message.member.displayName);

                } else {
                    message.reply('You are already in the game!');
                }
            }

            ord += 1;
            round += 1;


        } else if (!gameStart) {
            message.reply('No game was initiated!');
        } else if (!canPart) {
            message.reply('You cannot join an ongoing game!');
        }
    }

    if (args[0] === 'end') {
        args[0] = '';
        playerBot = false;
        gameStart = false;
        initGame = false;
        nextPlayer = false;
        for (i = 0; i < players.length; i++) {
            if (!players[i]['bot']) {
                message.guild.members.cache.get(players[i]['id']).roles.remove('698737459386908682');
                message.guild.members.cache.get(players[i]['id']).roles.remove('698737416122531922');
                message.guild.members.cache.get(players[i]['id']).roles.add(players[i]['role']);
            }

        }
        players = [];
        gameStart = false;
        initGame = false;
        canPart = true;
        nextPlayer = false;
        doneTurn = false;
        //var players = [];
        messagesToDelete = 0;
        messages = 0;
        cardColor = null;
        cardNum = null;

        deck = [];
        sDeck = [];

        players = [];

        ord = 0;
        order = [];

        changeColor = false;

        playerBot = false;
        next = false;
        players = [];
        deck = [];

        
        prevPlayer = null;
        prevPlayerCards;

        round = 1;
        message.channel.send("Game Ended");
    }

    if (args[0] === 'author') {
        message.channel.send('This bot was made by wackyboss');
    }

    if (args[0] === 'play') {
        if (nextPlayer) {
            messagesToDelete += 1;
            var chosenCards = [];
            var p = getIndexOfPlayer(players, 'order', order[ord % players.length]);
            var cont = true;
            var noCard = false;

            if (players[p]['bot']) {
                chosenCards = getBotChoice(players[p]);
                playerbot = false;

                console.log(chosenCards);
                if (chosenCards === null) {
                    console.log("Chosen Cards is null");
                    args.push('none');
                    noCard = true;
                    cont = false;
                }
            }


            var tDeck = [];
            for (z = 0; z < players[p]['deck'].length; z++) {
                tDeck.push(players[p]['deck'][z]);
            }
            //message.channel.send("Card on top of deck:");
            //message.channel.send("<:" + tDeck[0]['name'] + ":" + tDeck[0]['id'] + ">");

            //console.log("Deck");
            //console.log(players[p]);

            //  messages += 1;
            if (args.length === 1 && !players[p]['bot']) {
                message.reply("Please enter a card (using emoji menu) or type 'none' if you cannot go!")
            }
            else if (args[1] === 'none' || noCard) {
                players[p]['deck'].push(deck[deck.length - 1]);
                deck.splice(deck.length - 1, 1);
                nextPlayer = false;
                playerBot = false;
                args[0] = 'next';
                ord += 1;
                round += 1;
                console.log("NONE CARD");
            } else {
                if (!players[p]['bot']) {
                    console.log(args.length);
                    for (c = 1; c < args.length; c++) {
                        //console.log(args[i].split(":")[2]);
                        var fhi = args[c].split(":")[2];
                        // console.log(fhi.substring(0 , fhi.length - 1));
                        console.log(tDeck);
                        console.log(fhi);
                        var cardInDeck = getCardInDeck(tDeck, fhi.substring(0, fhi.length - 1));
                        console.log(cardInDeck);
                        // console.log(cardInDeck);
                        if (cardInDeck !== null) {
                            chosenCards.push(tDeck[cardInDeck]);
                            tDeck.splice(cardInDeck, 1);
                            console.log("Chosen Cards:");
                            console.log(chosenCards);
                            console.log("c: " + c + " args: " + args.length);
                        } else {
                            message.channel.send("Your deck does not contain one of these cards!");
                            messages += 2;
                            cont = false;
                            break;
                        }
                    }
                }

                if (cont) {
                    console.log("Player:");
                    console.log(players[p]);
                    console.log("chosenCards: ");
                    console.log(chosenCards);

                    var newDeck = applyDeckChanges(players[p], chosenCards);
                    console.log("NewDeck: " + newDeck);
                    if (newDeck) {
                        for (c = 0; c < chosenCards.length; c++) {
                            players[p]['deck'].splice(getCardInDeck(players[p]['deck'], chosenCards[c]['id']), 1);
                        }

                        if (players[p]['bot']) {
                            if (changeColor) {
                                var colors = ['r', 'b', 'g', 'y'];
                                //cardColor = colors[Math.floor(Math.random() * colors.length)];
                                var bc = getCardWithTrait(players[p]['deck'], 'color', 'r');
                                cardColor = 'r';
                                if (bc === null)
                                    bc = [];
                                for (f = 1; f < colors.length; f++) {
                                    var ac = getCardWithTrait(players[p]['deck'], 'color', colors[f]);
                                    if (ac === null) {
                                        ac = [];
                                    }
                                    if (ac.length >= bc.length) {
                                        cardColor = colors[f];
                                    }
                                }
                                changeColor = false;
                                cardNum = 0;
                            }
                        }

                        if (!changeColor) {
                            //args[0] = 'next';
                            next = true;
                            ord += 1;
                            round += 1;
                            playerBot = false;
                        }
                        nextPlayer = false;

                        prevPlayer = players[p];
                        prevPlayerCards = chosenCards;



                        // console.log("good");
                    } else {
                        message.channel.send("Your card selection breaks the rules of Uno! Try Again!");
                        //  console.log("bad");
                        messages += 1;
                    }

                }
            }

        }


    }

    if (args[0] === 'changecolor') {
        if (changeColor) {
            if (args[1].charAt(0) === 'r' || args[1].charAt(0) === 'b' || args[1].charAt(0) === 'g' || args[1].charAt(0) === 'y') {
                cardColor = args[1].charAt(0);
                cardNum = 0;
                changeColor = false;
                args[0] = 'next';
                playerBot = false;
                ord += 1;
                round += 1;
                // message.channel.send("Color changed to " + args[1]);
            } else {
                message.channel.send("That is an invalid color!");
            }
        } else {
            message.channel.send("You did not place down a change color card!");
        }
    }

    if (args[0] === 'next' || next) {
        console.log('NEXT');
        if (initGame && !changeColor) {
            console.log("NEXT2");
            next = false;
            for (i = 0; i < players.length; i++) {
                if (!players[i]['bot']) {
                    console.log(players[i]);
                    await message.guild.members.cache.get(players[i]['id']).roles.remove('698737459386908682');
                    await message.guild.members.cache.get(players[i]['id']).roles.add('698737416122531922');
                }

            }
            if (prevPlayer !== null) {
                var mes = 'Player ' + prevPlayer['name'] + ' placed down ';
                for (h = 0; h < prevPlayerCards.length; h++) {
                    mes += '<:' + prevPlayerCards[h]['name'] + ':' + prevPlayerCards[h]['id'] + '>';
                }

                const embedDisplayPlacedCard = new Discord.MessageEmbed().setColor('#00ff00').setTitle(mes).setDescription('');
                await message.channel.send(embedDisplayPlacedCard);
            }
            ////////////////////await message.channel.send(players[getIndexOfPlayer(players, 'order', order[(ord - 1) % players.length])] + " placed down a " + "<:" + sDeck[sDeck.length - 1]['name'] + ":" + sDeck[sDeck.length - 1]['id'] + ">");

            var mes = "";
            if (cardColor === 'r') {
                mes += ":red_circle:";
            }
            if (cardColor === 'b') {
                mes += ":blue_circle:";
            }
            if (cardColor === 'g') {
                mes += ":green_circle:";
            }
            if (cardColor === 'y') {
                mes += ":yellow_circle: ";
            }

            //////////////////await message.channel.send(mes);

            var p = getIndexOfPlayer(players, 'order', order[ord % players.length]);

            ////////////await message.channel.send("It is " + players[p]['name'] + "'s turn!");

            var embedInfoUpdate = new Discord.MessageEmbed().setTitle("Game Update").addFields(
                { name: 'Current Player', value: players[p]['name'] },
                { name: 'Current Color', value: mes },
                { name: 'Current Number', value: cardNum },
                { name: 'Card on top of deck', value: "<:" + sDeck[sDeck.length - 1]['name'] + ":" + sDeck[sDeck.length - 1]['id'] + ">" }
            );

            console.log("HEY IM HERE");
            await message.channel.send(embedInfoUpdate);

            for (i = 0; i < players.length; i++) {
                if (players[i]['order'] !== order[ord % players.length] && players[i]['bot'] === false) {
                    await message.guild.members.cache.get(players[i]['id']).roles.remove('698737416122531922');
                    await message.guild.members.cache.get(players[i]['id']).roles.add('698737459386908682');
                }
            }
            // console.log(ord % players.length);


            // if (!players[p]['bot']) {
            //     await message.guild.members.cache.get(players[p]['id']).roles.remove('698737459386908682');
            //     await message.guild.members.cache.get(players[p]['id']).roles.add('698737416122531922');
            // }
            // console.log("Deck2before");
            // console.log(players[p]['deck']);

            //////////////////await message.channel.send("Card on top of deck:");
            /////////////////await message.channel.send("<:" + sDeck[sDeck.length - 1]['name'] + ":" + sDeck[sDeck.length - 1]['id'] + ">");


            message.channel.send("Round " + round);
            console.log("WE AT THE END HERE");
            if (!players[p]['bot']) {
                displayDeck(players[p], players[p]['deck'], message, "Select your card [Multiple for combo]");
                playerBot = false;
                messagesToDelete += 4;
            } else {
                playerBot = true;
            }

            nextPlayer = true;

            //  console.log("Deck2");
            //    console.log(players[p]['deck']);

            //END
        } else if (changeColor) {
            message.channel.send("Please change color first!");
        }
        else {
            message.channel.send("Game was not started!");
        }

    }
    //         case 'cards': 
    //                 message.channel.send('These are your cards');

    //                 message.member.roles.add("698737416122531922");

    //                 let embed = new Discord.MessageEmbed();
    //                 embed.setColor(0xFFC300);
    //                 embed.setTitle("Choose Your Card (multiple for combo):");
    //                 embed.setDescription("");
    //                 let msgArgs = await message.channel.send(embed);

    //                 var pollOptions = ['698871056122904596', '698871056026435624', '698871055221260370', '698871054902231081'];

    //                 for(i = 0; i < pollOptions.length; i++) {
    //                     await msgArgs.react(pollOptions[i]);
    //                 }
    // ;
    //                 let pollFilter = (reaction, user) => !user.bot;
    //                 let reactions = (await msgArgs.awaitReactions(pollFilter, {max : 3}));

    //                 for(let i of reactions.values()) {
    //                     console.log(i.emoji.name);
    //                 }
    //                 message.member.roles.add("698737459386908682");
    //                 message.member.roles.remove("698737416122531922")

    //             break;
    if (args[0] === 'poll') {
        clientInformation.commands.get('poll').execute(message, args);
    }



})

bot.login(token);

function removeCards(deck, cards) {
    var tempDeck = deck;
    for (i = 0; i < cards; i++) {
        tempDeck.splice(getCardInDeck(deck, cards[i]['id']), 1);
    }
    return tempDeck;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// function nextInOrder() {
//     if(ord + 1 <= players.length - 1) {
//         return ord + 1;
//     } else {
//         return 0;
//     }
//}

function getCardWithTrait(deck, trait, id) {
    var cardsWithTrait = [];
    for (i = 0; i < deck.length; i++) {
        if (deck[i][trait] === id) {
            cardsWithTrait.push(deck[i]);
        }
    }
    if (cardsWithTrait.length !== 0) {
        return cardsWithTrait;
    } else {
        return null;
    }
}

function countCardWithTrait(deck, trait, id) {
    var count = 0;
    for (i = 0; i < deck.length; i++) {
        if (deck[i][trait] === id) {
            count += 1;
        }
    }
    return count;
}

function getBotChoice(bot) {
    var lastCard = sDeck[sDeck.length - 1];
    var bDeck = [];
    var chosenCards = [];
    console.log(bot['deck']);
    for (b = 0; b < bot['deck'].length; b++) {
        bDeck.push(bot['deck'][b]);
    }

    var sameColorCards = getCardWithTrait(bDeck, 'color', cardColor);
    var cardsSameNum = getCardWithTrait(bDeck, 'num', cardNum);
    if (cardsSameNum !== null) {
        var dfnum = getCardWithTrait(bDeck, 'color', cardColor);
        if (dfnum === null) {
            dfnum = [];
        }
        console.log("dfnum: " + dfnum.length);
        console.log(dfnum);
        console.log("CardsSameNum: " + cardsSameNum.length);
        console.log(cardsSameNum);
        var fchosenCards = [];
        var ffchosenCard = null;
        //fchosenCards.push(dfnum[0]);
        for (l = 0; l < cardsSameNum.length; l++) {
            var pfnum = getCardWithTrait(bDeck, 'color', cardsSameNum[l]['color']);
            if (pfnum === null) {
                pfnum = [];
            }
            console.log("pfnum: " + pfnum.length);
            console.log(pfnum);
            if (pfnum.length >= dfnum.length) {
                dfnum = pfnum;
                console.log("pfnum > dfnum");
                if (ffchosenCard !== null) {
                    fchosenCards.push(ffchosenCard);
                }
                ffchosenCard = cardsSameNum[l];
                console.log("ffchosencard");
                console.log(ffchosenCard);
                console.log(fchosenCards);
            }// else {
            //     fchosenCards.push(cardsSameNum[l]);
            //     console.log("else dfnum > pfnum");
            //     console.log(fchosenCards);
            // }
        }
        console.log("fchosenCards length: " + fchosenCards.length);

        if (ffchosenCard !== null) {
            fchosenCards.push(ffchosenCard);
        }

        if (fchosenCards.length !== 0) {
            return fchosenCards;
        }
    }


    if (sameColorCards === null) {
        var plus4Card = getCardWithTrait(bDeck, 'num', '13');
        var changeColorCard = getCardWithTrait(bDeck, 'num', '14');
        console.log("Plus 4 Card");
        console.log(plus4Card);
        console.log("change color card:");
        console.log(changeColorCard);
        if (plus4Card !== null) {

            return [plus4Card[0]];
        } else if (changeColorCard !== null) {

            return [changeColorCard[0]];
        } else {
            return null;
        }

        // return null;
    } else {
        var noSameNum = false;
        var sameNumIndex;
        var pNum, nNum;
        var tsameNumCards = [];
        allSameNumCards = [];
        for (n = 0; n < sameColorCards.length; n++) {
            tsameNumCards = getCardWithTrait(bDeck, 'num', sameColorCards[n]['num']);
            if (tsameNumCards.length > 1) {
                allSameNumCards.push(tsameNumCards);
            }
        }

        if (allSameNumCards.length === 0) {
            var tttc = [sameColorCards[Math.floor(Math.random() * sameColorCards.length)]];
            return tttc;
        } else {

            var psn = allSameNumCards[0].length;
            var nsn;
            var indexOfSameNum = 0;

            for (o = 1; o < allSameNumCards.length; o++) {
                nsn = allSameNumCards[o].length;
                if (nsn > psn) {
                    indexOfSameNum = o;
                }
            }

            var sameNumCards = allSameNumCards[indexOfSameNum];
            var tChosenCard = [];
            var ttChosenCard = null;
            var agh = getCardWithTrait(sameNumCards, 'color', cardColor)[0];
            var pNum = getCardWithTrait(bDeck, 'color', agh['color']);
            tChosenCard.push(agh);
            for (j = 1; j < sameNumCards.length; j++) {
                var nNum = getCardWithTrait(bDeck, 'color', sameNumCards[j]['color']);
                if (nNum.length >= pNum.length) {
                    pNum = nNum;
                    //ChosenCard.push(sameNumCards[j]);
                    if (ttChosenCard !== null) {
                        tChosenCard.push(ttChosenCard);
                    }
                    ttChosenCard = sameNumCards[j];
                } else {
                    tChosenCard.push(sameNumCards[j]);
                }
            }

            if (tChosenCard[tChosenCard.length - 1].length > pNum.length || tChosenCard.length > pNum.length) {
                return tChosenCard;
            } else {
                return [agh];
            }



        }

    }



}

function getIndexOfCard() {

}


function checkIsSame(bDeck, card) {
    for (i = 0; i < bDeck.length; i++) {
        if (bDeck === card)
            return true;
    }
    return false;
}

function getCombo() {

}

// function getCombo(ccCard, bDeck, lastCard) {
//     var tChosenCard = null;
//     var chosenCards = [];
//     var cCard = [];
//     for(h = 0; h < ccCard.length; h++) {
//         cCard.push(ccCard[h]);
//     }
//     var defNum = countCardWithTrait(bDeck, 'color', lastCard['color']);
//     console.log("Defnum: " + defNum);
//     console.log("cCard Length: " + cCard.length);
//     for (n = 0; n < cCard.length; n++) {
//         var newNum = countCardWithTrait(bDeck, 'color', cCard[n]['color']);
//         console.log("Newnum: " + newNum);
//         if (newNum >= defNum) {
//             console.log("Newnum >= defNum");
//             if (tChosenCard !== null) {
//                 chosenCards.push(tChosenCard);
//             }
//             defNum = newNum;
//             tChosenCard = cCard[n];
//             console.log("tChosenCard: " + tChosenCard);
//         } else {
//             console.log('DefNum > newNum');
//             chosenCards.push(cCard[n]);
//             console.log("Chosen Cards");
//             console.log(chosenCards);
//         }
//     }
//     if(tChosenCard !== null) {
//         chosenCards.push(tChosenCard);
//     }
//     return chosenCards;
// }

// function getBotChoice(bot) {
//     var lastCard = sDeck[sDeck.length - 1];
//     var bDeck = [];
//     var chosenCards = [];
//     console.log(bot['deck']);
//     for (b = 0; b < bot['deck'].length; b++) {
//         bDeck.push(bot['deck'][b]);
//     }

//     var cCard = getCardWithTrait(bDeck, 'num', lastCard['num']);
//     console.log("cCard 1");
//     console.log(cCard);
//     if (cCard.length !== 0) {
//         chosenCards = getCombo(cCard, bDeck, lastCard);
//         console.log("Chosen Cards Combo 1");
//         console.log(chosenCards);
//     } else {
//         cCard = getCardWithTrait(bDeck, 'color', lastCard['color']);
//         console.log("cCard 2");
//         console.log(cCard);
//         var randC = Math.floor(Math.random() * cCard.length);
//         chosenCards = getCombo(bDeck, cCard, cCard[randC]);
//         console.log("Chosen Cards Combo 2");
//         console.log(chosenCards);
//     }

//     return chosenCards;

//}





function applyDeckChanges(player, chosenCards) {
    console.log("Chosen cards in Apply Deck Changes: ");
    console.log(chosenCards);
    console.log("Length: " + chosenCards.length);
    console.log(chosenCards[0]);
    console.log("My Card color: " + chosenCards[0]['color']);
    console.log("Last Color: " + cardColor);
    console.log("My Card num: " + chosenCards[0]['num']);
    console.log("Last num: " + cardNum);
    if ((chosenCards[0]['color'] === cardColor || chosenCards[0]['num'] === cardNum || chosenCards[0]['color'] === 'a')) {
        console.log("IF1");
        console.log("Chosen Cards Length: " + chosenCards.length);
        if (chosenCards.length > 1) {
            for (i = 1; i < chosenCards.length; i++) {
                if ((chosenCards[i]['num'] === chosenCards[i - 1]['num'])) {
                    console.log("IF2");
                    continue;
                } else {
                    // message.console.send()
                    console.log("False2");
                    return false;
                }
            }
        }
        var lastCard = chosenCards[chosenCards.length - 1];
        console.log(lastCard['num']);

        for (i = 0; i < chosenCards.length; i++) {
            sDeck.push(chosenCards[i]);
        }
        if (lastCard['num'] === '10') {
            console.log("Card: x");
            ord += 1;
            // if(ord + 2 <= players.length - 1) {
            //     ord += 2;
            // } else if(Math.abs((players.length-1) - (ord)) === 2) {
            //     ord = 1;
            // } else {
            //     ord = 0;
            // }
            //  console.log(ord % players.length);
            cardColor = lastCard['color'];
            cardNum = lastCard['num'];
            player['deck'] = removeCards(player['deck'], chosenCards);
            console.log("Returned True");
            return true;
        }

        else if (lastCard['num'] === '11') {
            console.log("Card: Reverse");
            console.log(order);
            order = [];
            ord = players.length - 1;
            // order.push(player['order']);
            for (i = player['order'] - 1; i >= 0; i--) {
                order.push(i);
            }
            for (i = players.length - 1; i >= player['order']; i--) {
                order.push(i);
            }
            //console.log(order);
            console.log(order);
            cardColor = lastCard['color'];
            cardNum = lastCard['num'];
            player['deck'] = removeCards(player['deck'], chosenCards);
            console.log("Returned True");
            return true;
        }

        else if (lastCard['num'] === '12' || lastCard['num'] === '13') {
            console.log("Plus");
            var mod;
            if (lastCard['num'] === '12') {
                cardColor = lastCard['color'];
                cardNum = lastCard['num'];
                mod = 2;
            } else {
                changeColor = true;
                mod = 4;
            }
            player['deck'] = removeCards(player['deck'], chosenCards);
            // for(i = 0; i < players.length; i++) {
            //  if(players[i]['order'] === order[((ord+1)  % players.length)]) {
            for (z = 0; z < mod * chosenCards.length; z++) {
                //  var randPlusCard = Math.floor(Math.random() * deck.length);
                players[order[(ord + 1) % players.length]]['deck'].push(deck[deck.length - 1]);
                /////
                // console.log(deck[randPlusCard]);
                deck.splice(deck.length - 1, 1);
            }
            // }
            // }
            console.log("Returned True");
            return true;
        } else if (lastCard['num'] === '14') {
            changeColor = true;
            return true;
        }
        else {

            cardColor = lastCard['color'];
            cardNum = lastCard['num'];
            player['deck'] = removeCards(player['deck'], chosenCards);
            console.log("Returned true on under 9");
            return true;
        }

    } else {
        console.log("false1");
        return false;
    }

}

function checkCardInDeck(deck, card) {
    for (i = 0; i < deck.length; i++) {
        if (deck[i]['id'] === card) {
            return true;
        }
    }
    return false;
}

function getCardInDeck(deck, card) {
    for (i = 0; i < deck.length; i++) {
        if (deck[i]['id'] === card) {
            return i;
        }
    }
    return null;
}

function getIndexOfPlayer(players, property, compare) {
    for (i = 0; i < players.length; i++) {
        if (players[i][property] === compare) {
            return i;
        }
    }
    return null;
}

function shuffleDeck(deck) {
    var nDeck = deck;
    n = deck.length;
    for (i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i - 1));
        var temp = nDeck[i];
        nDeck[i] = nDeck[j];
        nDeck[j] = temp;
    }

    return nDeck;
}

function generateDeck() {
    var deck = [];
    var files = fs.readdirSync('C:/Users/amer alwan.WACKYBOSS/Desktop/Discord/imgs/images/');
    files.forEach(file => {
        if (!file.includes(',')) {
            var cardInfo = file.split('_');
            var card = { name: "", num: cardInfo[0], color: cardInfo[1], id: cardInfo[2].substring(0, cardInfo[2].indexOf('.')) };
            if (cardInfo[0] === '10') {
                card['name'] += "x";
            } else if (cardInfo[0] === '11') {
                card['name'] += "Reverse";
            } else if (cardInfo[0] === '12') {
                card['name'] += "Plus2";
            } else if (cardInfo[0] === '13') {
                card['name'] += "Plus4";
            } else if (cardInfo[0] === '14') {
                card['name'] += "changeColor";
            } else {
                card['name'] += cardInfo[0];
            }

            card['name'] += "_" + cardInfo[1];
            if (card['color'] === 'a') {
                for (i = 0; i < 4; i++) {
                    deck.push(card);
                }
            } else {
                for (i = 0; i < 2; i++) {
                    deck.push(card);
                }
            }

        }
    });
    return deck;
}

function getDeck(deck, n) {
    var pDeck = deck;
    var nDeck = [];
    for (i = 0; i < n; i++) {
        var rand = Math.floor((Math.random() * (pDeck.length)));
        nDeck.push(pDeck[rand]);
        pDeck.splice(rand, 1);
    }
    return [pDeck, nDeck];
}

function checkIncludes(array, arg, index, id) {
    for (x = index; x < array.length; x++) {
        if (array[x][id] === arg[id]) {
            return true;
        }
    }
    return false;
}


function checkIndexOfCard(deck, card, index) {
    if (index !== null) {
        for (c = index; c < deck.length; c++) {
            if (deck[c]['id'] === card['id']) {
                return c;
            }
        }
    }
    return null;
}

function isolateDeck(tdeck) {
    var deck = tdeck;
    var decks = [[], [], [], []]
    while (deck.length > 0) {

        var ind = 0;
        var temp = deck[0];

        for (z = 0; z < 4; z++) {
            ind = checkIndexOfCard(deck, temp, ind);
            if (ind !== null) {
                decks[z].push(deck[ind]);
                deck.splice(ind, 1);
            }
        }
    }

    return decks;
}

async function displayDeck(player, tdeck, message, text) {

    var embedFullDeck;
    //    var msgArgsFullDeck;
    var zdeck = [];

    for (i = 0; i < tdeck.length; i++) {
        zdeck.push(tdeck[i]);
    }

    var decks = isolateDeck(zdeck);

    var index = 1;
    var text = text;
    var once = true;
    var sDeck = [];
    let pollFilter;
    let reactions = [];
    let msgArgsFullDeck = [];
    for (z = 0; z < decks.length; z++) {
        if (z > 0) {
            text = "";
        }
        if (decks[z] !== null) {
            embedFullDeck = new Discord.MessageEmbed().setColor(0xFFC300).setTitle(text).setDescription("");
            msgArgsFullDeck.push(await message.channel.send(embedFullDeck));
        }
        for (i = 0; i < decks[z].length; i++) {

            if (index % 20 == 0) {

                embedFullDeck = new Discord.MessageEmbed().setColor(0xFFC300).setTitle("").setDescription("");

                msgArgsFullDeck.push(await message.channel.send(embedFullDeck));



            }

            await msgArgsFullDeck[msgArgsFullDeck.length - 1].react(decks[z][i]['id']);
            index += 1;

        }
    }

}