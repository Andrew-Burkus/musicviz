function split() {
    var halfWidth = width / 2;
    var halfHeight = height / 2;

    line(halfWidth, 0, halfWidth, height);
    line(0, halfHeight, width, halfHeight);
}
