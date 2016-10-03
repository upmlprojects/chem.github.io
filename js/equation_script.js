i1function balancer () {
    "use strict";
    console.log("start");
    //input_part
    var input_reaction = document.getElementById("input_el");
    var output_reaction = document.getElementById("output_el");
    var result_field = document.getElementById("result");
    //definition formulas and elements list
    var input_formulas_list = [];
    var output_formulas_list = [];
    var input_elements_list = [];
    var output_elements_list = [];
    dataAnalyzer(input_reaction.value, input_formulas_list, input_elements_list);
    dataAnalyzer(output_reaction.value, output_formulas_list, output_elements_list);
    var all_is_correct = equateParts(input_formulas_list, output_formulas_list, input_elements_list, output_elements_list);
    var output_string = "";
    if (all_is_correct) {
        var input_substr = "";
        for (var formula in input_formulas_list) {
            var index = input_formulas_list[formula];
            if (index != 1) 
                input_substr += index;
            input_substr += formula + " + ";
        }
        var output_substr = "";
        for (var formula in output_formulas_list) {
            var index = output_formulas_list[formula];
            if (index != 1)
                output_substr += index;
            output_substr += formula + " + ";
        }
        output_string += input_substr.substring(0, input_substr.length - 3);
        output_string += " = ";
        output_string += output_substr.substring(0, output_substr.length - 3);
    }
    else output_string = "Error was occured";
    result_field.innerHTML = output_string;
}

function dataAnalyzer (reaction, formulas_list, elements_list) {
    "use strict";
    var firstSymbol = 0; //First symbol of chem element
    for (var i = 0; i < reaction.length; i++) { //loop for searching '+'
        if (reaction[i] == "+") {  // if find
            formulas_list[reaction.substring (firstSymbol, i - 1)] = 1; //make formula list
            //console.log(reaction.substring (firstSymbol, i - 1));
            firstSymbol = i + 2; //chnage symbol index
        }
    }
    formulas_list[reaction.substring (firstSymbol, reaction.length)] = 1; //needs, because loop treats only data before the plus, but skip the last formula
    //console.log(reaction.substring (firstSymbol, reaction.length));
    for (var formula in formulas_list) {
        takeElementWithIndex(elements_list, formula, formulas_list[formula], false);
    }
}

function takeElementWithIndex(elements_list, formula, formula_index, erase) {
    var element = ""; //current element
    var firstBracketPosition, lastBracketPosition; //bracket positions
    firstBracketPosition = formula.indexOf("("); //search brackets
    lastBracketPosition = formula.indexOf(")");
    var isBracket = -1; //if we have brackets - don't send brackets index to elements
    var bracket_index = 1;
    
    if (firstBracketPosition == -1 || lastBracketPosition == -1) {
        lastBracketPosition = formula.length + 1;
        firstBracketPosition = formula.length + 1;
        isBracket = 0;
    }
    
    for (var i = 0; i < formula.length + isBracket; i++) { //here we using isBracket, see explanetion in defenition of variable
        bracket_index = 1; //set 1 each itteration
        if (formula[i] == formula[i].toUpperCase() && formula[i] != "(" && formula[i] != ")") { //check in order to not write '(' ')' to element
            element += formula[i]; //write to element uppercase
            if (i + 1 < formula.length && formula[i + 1] == formula[i + 1].toLowerCase() && formula[i + 1] != "(" && formula[i + 1] != ")") { //look for lowercase sybol to form two-character elements like Mn or Ca
                element += formula[i + 1];
                i++; //dont write ""
                if (i + 1 < formula.length && !isNaN(formula[i + 1])) { //only God know's why i should use this shit
                    element += formula[i + 1];
                    i++;
                }
            }
            if (firstBracketPosition < i && i < lastBracketPosition && lastBracketPosition != firstBracketPosition) { //look for brackets (we push bracket_index to elements that located in brackets)
                bracket_index = parseInt(formula[formula.length - 1]);
            }
            //console.log(element);
            if (elements_list[elementSeparator(element)] == undefined) 
                elements_list[elementSeparator(element)] = indexSeparartor(element, formula_index, bracket_index);
            else 
                elements_list[elementSeparator(element)] += indexSeparartor(element, formula_index, bracket_index);
        }
        
        element = ""; //set "", prepare to new loop
    }
}

function indexSeparartor (element, formula_index, bracket_index) { //detach index from element example: Mg12 - return 12. Result depends on bracket_index (if we have brackets: Ca(OH)2) and on formula_index (if we have index before formula: 2H2O)
    var index = 0; //defenition of index that should be retuned
    var searchPosition = 0; //set position of the last non-numeric character
    if (element.length > 1) { //if > 1 search the index
        if (isNaN(element[1])) // check if the second charcater is non-numeric
            searchPosition++; //increase if true
        if (searchPosition + 1 == element.length)
            return bracket_index * formula_index;
        if (!isNaN(element[element.length - 1])) { //check if the last character is numeric
            var digit = 1; //if we hawe H12 we should return 12. It contains 2 + 1*10
            for (var i = element.length - 1; i > searchPosition; i --) { //search from last to searchPosition
                index += parseInt(element[i]) * digit; //set index
                digit *= 10; //if more then one itteration increase digit
            }
        }
        //console.log(element, index);
        return index * formula_index * bracket_index; //return index
    }
    else 
        return bracket_index * formula_index; //if we have only 1 index depends on bracket index and formula index for example oxygen in H2O: 2H2O - 2O or 2Ca(OH)2: O - 4
}

function elementSeparator (element) { //detach elemnt from index example: Mn123 return Mn
    var currElement = ""; //variable to write element
    currElement += element[0]; //write first character
    if (element.length > 1) { //if length of element > 1 check if 2-nd element non-numeric
        if (isNaN(element[1]))
            currElement += element[1]; //true write second element to
    }
    return currElement; //return element without index
}

function listDataEraser (list) { //erase index's in asociative lists
    for (var i in list) {
        list[i] = null;
    }
}

function isIntCoef (number) { //check if coef is int
    var copy_of_number = number;
    if (copy_of_number == parseInt(number))
        return true;
    else 
        return false;
}

function elementCounter(formulas_list, element) { // counts how many times element meets in formulas
    var count = 0;
    for (var formula in formulas_list) {
        if (formula.indexOf(element) != -1)
            count++;
    }
    return count;
}

function isEqual(input_elements, output_elements) { //check if we can leave the quateParts loop
    for (var element in input_elements) {
        if (input_elements[element] - output_elements[element] != 0)
            return false;
    }
    return true;
}

function findFormulaWithElement (formulas_list, element) {
    for (var formula in formulas_list) {
        if (formula.indexOf(element) != -1)
            return formula;
    }
}

function equateParts (input_formulas, output_formulas, input_elements, output_elements) {
    var time_out = 0;
    console.log("++++++++++++++++++++");
    while (true) {
        time_out++;
        var curr_formulas = [];
        for (var element in input_elements) {
            var element_ratio = output_elements[element] / input_elements[element];
            console.log(element_ratio, " = ", element);
            var searchInFirst = true;
            if (element_ratio < 1) {
                curr_formulas = output_formulas;
                element_ratio = 1 / element_ratio;
                searchInFirst = false;
            }
            else {
                searchInFirst = true;
                curr_formulas = input_formulas;
            }
            console.log(element_ratio);
            
            if (isIntCoef(element_ratio) && elementCounter(curr_formulas, element) == 1) {
                var formula = findFormulaWithElement (curr_formulas, element);
                console.log(formula);
                if (searchInFirst) {
                    input_formulas[formula] = element_ratio;
                    listDataEraser(input_elements);
                    for (var currFormula in input_formulas) {
                        takeElementWithIndex(input_elements, currFormula, input_formulas[currFormula], false);
                        //console.log("currFormula = ", currFormula);
                    }
                }
                else {
                    output_formulas[formula] = element_ratio;
                    listDataEraser (output_elements);
                    for (var currFormula in output_formulas) {
                        takeElementWithIndex(output_elements, currFormula, output_formulas[currFormula], false);
                        //console.log("currFormula = ", currFormula);
                    }
                }
                
            }
        }
        if (isEqual(input_elements, output_elements)) {
            console.log("equaled");
            return true;
        }
        else if (time_out > 1000) { 
            console.log("error");
            return false;
        }
    }
}



