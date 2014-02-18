function findMax(numbArray)
{
	var max = numbArray[0];
	for (var i = 0; i < numbArray.length; i++)
	{
		if (numbArray[i] > max) max = numbArray[i];
	}
	return max;
}
	
	
function getSquare(someNumber)
{
	return someNumber*someNumber;
}

function squareList(numbers)
{
	for(i in numbers)
	{
		numbers[i] = getSquare(numbers[i]);
	}
	return numbers;
}

function findMaxFive(numbArray)
{
	var maxArray = [];
	var curMinMax;

	for (var j = 0; j < 5; j++)
	{
		var curMax = 0;

		for (var i = 0; i < numbArray.length; i++)
		{
			if (numbArray[i] > curMax)
			{
				if (j > 0 && numbArray[i] < curMinMax)
					curMax = numbArray[i];
				else if (j == 0)
					curMax = numbArray[i];
			}
		}
		curMinMax = curMax;
		maxArray[j] = curMax;
	}
    return maxArray;
}


function merge(tuple){
	var left = tuple[0];
	var right = tuple[1];
    var result  = [],
        il      = 0,
        ir      = 0;

    while (il < left.length && ir < right.length){
        if (left[il] < right[ir]){
            result.push(left[il++]);
        } else {
            result.push(right[ir++]);
        }
    }

    return result.concat(left.slice(il)).concat(right.slice(ir));
}

function mergesort(items){

    // Terminal case: 0 or 1 item arrays don't need sorting
    if (items.length < 2) {
        return items;
    }

    var middle = Math.floor(items.length / 2),
        left    = items.slice(0, middle),
        right   = items.slice(middle);

    return merge([mergesort(left), mergesort(right)]);
}