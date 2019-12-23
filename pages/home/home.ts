import { Component } from "@angular/core";
import { NavController } from "ionic-angular";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  private factoryJSON: IFactoryJSON<Teste>;

  constructor(public navCtrl: NavController) {
    this.factoryJSON = new FactoryJSON<Teste>();

    let x = this.factoryJSON
      .adicionarEntidade()
      .adicionarColuna({
        coluna1: {
          mascara: "dd/mm/yyyy",
          nome: "nome1"
        },
        coluna2: {
          replace: { chave: "i", valor: "u" }
          //nome: "nome2"
        }
      })
      .adicionarModelo({ coluna1: "ricardo", coluna2: "david" });
    // .getJSON();

    console.log(x.getJSON());

    this.factoryJSON.adicionarEntidade().removerColuna("coluna1");
  }
}

export interface IFactoryJSON<T> {
  adicionarEntidade(): IManuseiaColuna<T>;
  removerColuna(model: T): IRemoveColuna<T>;
}

export interface IManuseiaColuna<T> {
  adicionarColuna(parametrosJSON: PartialWithNewMember<T>): IModeloConcreto<T>;
  removerColuna(parametrosJSON: keyof T | Array<keyof T>): IRemoveColuna<T>;
  formataValor(parametrosJSON: ConfiguraColuna): IFormataValor;
}

export interface IAdicionaColuna<T> {
  adicionarColuna(parametrosJSON: PartialWithNewMember<T>): IAdicionaColuna<T>;
  getJSON(): string;
}

export interface IRemoveColuna<T> {
  removerColuna(parametrosJSON: ConfiguraColuna): IRemoveColuna<T>;
}

export interface IFormataValor {
  formataValor(): IFormataValor;
}

export interface IModeloConcreto<T> {
  adicionarModelo(model: T): ICriaJSON<T>;
}

export interface ICriaJSON<T> {
  getJSON(): string;
}

export class ConfiguraColuna {
  mascara?: string | RegExp;
  replace?: ChaveValor | ChaveValor[];
  nome?: string;
}

export class ChaveValor {
  chave: string;
  valor: string;
}

export class Teste {
  coluna1: string;
  coluna2: string;
}

export class Teste2 {
  coluna1: string;
  coluna2: string;
  coluna3: string;
}

// Use this:
type PartialWithNewMember<T> = { [P in keyof T]?: ConfiguraColuna };
type PartialWithNewMember2<T> = { coluna: [keyof T] };
/**
 * Turn all properties of T into strings
 */
type Stringify<T> = { [P in keyof T]: string };

export class FactoryJSON<T> implements IFactoryJSON<T> {
  adicionarEntidade<T>(): IManuseiaColuna<T> {
    return new ManuseiaColuna<T>();
  }

  removerColuna<T>(model: T): IRemoveColuna<T> {
    return null;
  }
}

export class ManuseiaColuna<T> implements IManuseiaColuna<T> {
  adicionarColuna(configJSON: PartialWithNewMember<T>): IModeloConcreto<T> {
    console.log(Object.getOwnPropertyNames(configJSON));
    console.log(configJSON);
    console.log(configJSON["coluna2"]);

    return new ModeloConcreto<T>(configJSON);
  }
  removerColuna(tipo: keyof T | Array<keyof T>): IRemoveColuna<T> {
    return null;
  }
  formataValor(tipo: ConfiguraColuna): IFormataValor {
    return null;
  }
}

export class ModeloConcreto<T> implements IModeloConcreto<T> {
  private _configJSON: PartialWithNewMember<T>;
  private _novoObjeto = {};

  constructor(private configJSON: PartialWithNewMember<T>) {
    this._configJSON = configJSON;
  }

  adicionarModelo(modeloOriginal: T): ICriaJSON<T> {
    // monta novoObjeto
    Object.getOwnPropertyNames(this._configJSON).forEach(
      (value, index, array) => {
        console.log(value, index, array, this._configJSON[value]);

        // objeto que contém a configuração para cada coluna.
        let configuraColuna = this._configJSON[value] as ConfiguraColuna;

        // aplica o replace caso exista configuração especificada
        console.log(configuraColuna.replace);
        let replaceValor = configuraColuna.replace
          ? this.replace(
              modeloOriginal[value] as string,
              configuraColuna.replace
            )
          : modeloOriginal[value];

        // adiciona o nome da propriedade e valor para a nova coluna
        this._novoObjeto[
          configuraColuna.nome ? configuraColuna.nome : value
        ] = replaceValor;
      }
    );

    return new CriaJSON<T>(this._novoObjeto);
  }

  private replace(valor: string, replacer: ChaveValor | ChaveValor[]): string {
    if (replacer instanceof Array)
      replacer.forEach((value, index) => {
        let chaveValor: ChaveValor = value as ChaveValor ;
        while (valor.includes(chaveValor.chave))
          valor = valor.replace(chaveValor.chave, chaveValor.valor);
      });
    else
      while (valor.includes(replacer.chave))
        valor = valor.replace(replacer.chave, replacer.valor);

    return valor;
  }
}

export class CriaJSON<T> implements CriaJSON<T> {
  private _jsonObject: any;

  constructor(jsonObject: any) {
    this._jsonObject = jsonObject;
  }

  getJSON() {
    return JSON.stringify(this._jsonObject);
  }
}
