module.exports = (product, tempCard) => {
    let outputCard = tempCard.replace(/{%PRODUCTNAME%}/g, product.productName);
    outputCard = outputCard.replace(/{%ID%}/g, product.id);
    outputCard = outputCard.replace(/{%IMAGE%}/g, product.image);
    outputCard = outputCard.replace(/{%FROM%}/g, product.from);
    outputCard = outputCard.replace(/{%NUTRIENTS%}/g, product.nutrients);
    outputCard = outputCard.replace(/{%QUANTITY%}/g, product.quantity);
    outputCard = outputCard.replace(/{%PRICE%}/g, product.price);
    outputCard = outputCard.replace(/{%ORGANIC%}/g, product.organic);
    outputCard = outputCard.replace(/{%DESCRIPTION%}/g, product.description);
    if(!product.organic){
        outputCard = outputCard.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
    }
    return outputCard;
}