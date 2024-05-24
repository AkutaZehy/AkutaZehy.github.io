function welcome() {
    let num = Math.random();

    if (num > 0.9) {
        window.alert("休憩中よ。");
    } else if (num > 0.8) {
        window.alert("今日もいい天気！");
    }
}

welcome();