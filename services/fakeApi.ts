const TEST_EMAIL = process.env.TEST_USER_EMAIL || "teste@banana.com";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || "123456";

export function fakeLogin(email: string, password: string) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === TEST_EMAIL && password === TEST_PASSWORD) {
        resolve({
          name: "Gabriel",
          balance: 1978.6,
          transactions: [
            { id: "1", title: "Pix recebido", amount: 250 },
            { id: "2", title: "Compra no mercado", amount: -48.9 },
            { id: "3", title: "Uber", amount: -22.5 },
            { id: "4", title: "Salário", amount: 1800 },
          ],
        });
      } else {
        reject("Email ou senha inválidos");
      }
    }, 1500); // simula tempo da API
  });
}
