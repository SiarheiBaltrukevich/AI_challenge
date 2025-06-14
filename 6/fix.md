# First, the rotor stepping mechanism:

## Issue description

The first issue is in the rotor stepping mechanism. In the real Enigma machine:
The right rotor always steps
The middle rotor steps when the right rotor is at its notch
The left rotor steps when the middle rotor is at its notch
There's also a double-stepping mechanism where the middle rotor steps when it's at its notch

## Solution

Implemented proper double-stepping mechanism
Middle rotor now steps when either the right rotor is at its notch OR when the middle rotor itself is at its notch
Left rotor steps when either the middle or right rotor is at its notch

# Second, the rotor position calculations. 

## Issue description

Doesn't properly account for the relationship between ring settings and rotor positions
The forward and backward transformations aren't properly symmetric

## Solution

Properly implemented the relationship between ring settings and rotor positions
Added proper calculation of effective position considering both ring setting and current position
Fixed the forward and backward transformations to properly account for the ring setting

# Third, the plugboard implementation.

## Issue description

The third issue is that the plugboard is only applied once at the beginning. In the real Enigma machine, the plugboard should be applied both before and after the rotor/reflector process.

## Solution

Now applying plugboard swap both before and after the rotor/reflector process
This ensures proper encryption and decryption
