import math

sum = 0
for i in range(1,59+1):
    sum += 90*math.pow(1.1, i-1)

print(sum)

sum = 0
for i in range(0,69+1):
    sum += 4*i+7

print(sum)